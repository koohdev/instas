import { chromium, Browser } from "playwright";
import { sanitizeTitle, sanitizeDescription } from "./sanitize";

export interface ScrapedData {
  url: string;
  displayUrl: string;
  title: string;
  description: string;
  screenshotBase64: string;
  error?: string;
}

export function normalizeUrl(raw: string): string {
  let u = raw.trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) {
    u = "https://" + u;
  }
  return u;
}

export function getDisplayUrl(rawUrl: string): string {
  try {
    const url = normalizeUrl(rawUrl);
    const parsed = new URL(url);
    let host = parsed.hostname;
    if (host.startsWith("www.")) {
      host = host.slice(4);
    }
    return host; // e.g. "reactbits.dev" or "pillarstack.com"
  } catch {
    return rawUrl
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0];
  }
}

export async function scrapeUrl(
  rawUrl: string,
  existingBrowser?: Browser
): Promise<ScrapedData> {
  const url = normalizeUrl(rawUrl);
  const displayUrl = getDisplayUrl(rawUrl);

  const browser = existingBrowser || (await chromium.launch({ headless: true }));
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    } catch {
      await page.goto(url, { waitUntil: "commit", timeout: 15000 }).catch(() => {});
    }

    await page.waitForLoadState("load", { timeout: 8000 }).catch(() => {});

    // Auto-hide or dismiss cookie banners and overlays
    await page.evaluate(() => {
      // 1. Attempt to click "Accept" or "Agree" buttons
      const btnSelectors = [
        "button", "a", "[role='button']", "input[type='button']", "input[type='submit']"
      ];
      const acceptKeywords = ["accept", "agree", "allow", "got it", "consent", "continue"];

      const buttons = document.querySelectorAll(btnSelectors.join(","));
      for (const btn of Array.from(buttons)) {
        const text = (btn.textContent || "").toLowerCase().trim();
        if (acceptKeywords.some(keyword => text.includes(keyword)) && btn instanceof HTMLElement) {
          try { btn.click(); } catch (e) {}
        }
      }

      // 2. Hide high z-index elements containing GDPR/cookie/privacy keywords
      const overlayKeywords = ["cookie", "gdpr", "privacy", "consent", "banner"];
      const elements = document.querySelectorAll("div, section, aside, form, dialog");

      for (const el of Array.from(elements)) {
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex, 10);
        const text = (el.textContent || "").toLowerCase();

        // Hide if fixed/absolute and has high z-index and contains keywords
        if (
          (style.position === "fixed" || style.position === "absolute" || style.position === "sticky") &&
          !isNaN(zIndex) && zIndex > 10 &&
          overlayKeywords.some(keyword => text.includes(keyword))
        ) {
          if (el instanceof HTMLElement) {
            el.style.display = "none";
          }
        }
      }
    }).catch(() => {});

    await page.waitForTimeout(1500); // Give it a bit more time to settle

    const rawTitle = await page
      .evaluate(() => document.title || "")
      .catch(() => "");

    const rawDesc = await page
      .evaluate(
        () =>
          (
            document.querySelector('meta[name="description"]') as HTMLMetaElement
          )?.content || ""
      )
      .catch(() => "");

    const screenshotBuf = await page.screenshot({
      fullPage: false,
      clip: { x: 0, y: 0, width: 1440, height: 814 },
      type: "jpeg",
      quality: 90,
      animations: "disabled",
      timeout: 15000,
    });

    await context.close();
    if (!existingBrowser) await browser.close();

    return {
      url,
      displayUrl,
      title: sanitizeTitle(rawTitle) || getDisplayUrl(url),
      description: sanitizeDescription(rawDesc),
      screenshotBase64: screenshotBuf.toString("base64"),
    };
  } catch (err: unknown) {
    await context.close();
    if (!existingBrowser) await browser.close();

    const message = err instanceof Error ? err.message : String(err);
    return {
      url,
      displayUrl,
      title: displayUrl,
      description: "Could not load page.",
      screenshotBase64: "",
      error: message,
    };
  }
}
