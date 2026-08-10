import { chromium, Browser } from "playwright";
import { saveRenderData, deleteRenderData } from "./renderStore";
import crypto from "crypto";
import type { AspectRatio } from "./types";
import { ASPECT_RATIO_DIMENSIONS } from "./types";

export interface CompositeParams {
  type: "cover" | "content";
  // Cover fields
  coverTitle?: string;
  coverSubtitle?: string;
  // Content fields
  screenshotBase64?: string;
  siteTitle?: string;
  siteDescription?: string;
  siteUrl?: string;
  slideNumber?: number;
  // Branding fields
  topLeftText?: string;
  topRightText?: string;
  bottomLeftText?: string;
  bottomRightText?: string;
  bottomRightIcon?: string;
  // Shared visual settings
  blurAmount: number;
  borderRadius: number;
  noiseOpacity: number;
  dropShadow: boolean;
  showBlurredBg: boolean;
  bgType?: "default" | "blurred" | "custom";
  customBgImage?: string;
  fontFamily?: string;
  // Card Outer Framing
  cardOuterBg?: string;
  cardPadding?: number;
  cardBorderRadius?: number;
  // Layout offsets (px)
  screenshotTop?: number;
  screenshotHeight?: number;
  titleTop?: number;
  subtitleTop?: number;
  urlPillTop?: number;
  // Export format
  aspectRatio?: AspectRatio;
}

// Global Browser Pool Singleton for 5x faster batch rendering
let globalBrowserPool: Browser | null = null;

export async function getSharedBrowser(): Promise<Browser> {
  if (globalBrowserPool && globalBrowserPool.isConnected()) {
    return globalBrowserPool;
  }
  globalBrowserPool = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  return globalBrowserPool;
}

export async function closeSharedBrowser(): Promise<void> {
  if (globalBrowserPool) {
    await globalBrowserPool.close().catch(() => {});
    globalBrowserPool = null;
  }
}

export async function compositeSlide(
  params: CompositeParams,
  baseUrl: string,
  existingBrowser?: Browser
): Promise<Buffer> {
  const id = crypto.randomUUID();
  saveRenderData(id, params);

  const browser = existingBrowser || (await getSharedBrowser());
  const dims = ASPECT_RATIO_DIMENSIONS[params.aspectRatio ?? "4:5"];
  const context = await browser.newContext({
    viewport: { width: dims.width, height: dims.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    // Navigate — the render page itself injects @font-face in its <head>
    await page.goto(`${baseUrl}/render?id=${id}`, {
      waitUntil: "networkidle",
      timeout: 25000,
    }).catch(async () => {
      await page.goto(`${baseUrl}/render?id=${id}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    });

    // Wait for all fonts (including custom) and images to be fully loaded
    await page.evaluate(async () => {
      // Wait for document fonts API
      if (document.fonts) {
        await document.fonts.ready.catch(() => {});
        // Force load each declared font family
        const families: string[] = [];
        document.fonts.forEach((f) => families.push(f.family));
        await Promise.all(
          families.map((fam) =>
            document.fonts.load(`16px '${fam}'`).catch(() => {})
          )
        ).catch(() => {});
      }
      // Wait for all images to decode
      const imgs = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      ).catch(() => {});
    }).catch(() => {});

    // Extra settle time for font painting
    await page.waitForTimeout(400);

    let buf: Buffer;
    try {
      buf = await page.screenshot({
        type: "png",
        animations: "disabled",
        timeout: 20000,
      });
    } catch {
      await page.waitForTimeout(300);
      buf = await page.screenshot({
        type: "png",
        animations: "disabled",
        timeout: 20000,
      });
    }

    await context.close();
    // Only close browser if an explicit unshared browser was passed in
    if (existingBrowser && existingBrowser !== globalBrowserPool) {
      await existingBrowser.close().catch(() => {});
    }
    deleteRenderData(id);

    return buf;
  } catch (err) {
    await context.close();
    if (existingBrowser && existingBrowser !== globalBrowserPool) {
      await existingBrowser.close().catch(() => {});
    }
    deleteRenderData(id);
    throw err;
  }
}
