import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { scrapeUrl } from "@/lib/scraper";
import { compositeSlide, CompositeParams } from "@/lib/compositor";
import { getOutputDir, savePng } from "@/lib/output";

export const maxDuration = 300; // 5 min max for route handler

export async function POST(req: NextRequest) {
  let browser;
  try {
    const body = await req.json();
    const {
      urls,
      coverTitle,
      coverSubtitle,
      batchName,
      topLeftText,
      topRightText,
      bottomLeftText,
      bottomRightText,
      bottomRightIcon,
      fontFamily,
      blurAmount,
      borderRadius,
      noiseOpacity,
      dropShadow,
      showBlurredBg,
      bgType,
      customBgImage,
      screenshotTop,
      screenshotHeight,
      titleTop,
      subtitleTop,
      urlPillTop,
    } = body as {
      urls: string[];
      coverTitle: string;
      coverSubtitle: string;
      batchName?: string;
      topLeftText?: string;
      topRightText?: string;
      bottomLeftText?: string;
      bottomRightText?: string;
      bottomRightIcon?: string;
      fontFamily?: string;
      blurAmount: number;
      borderRadius: number;
      noiseOpacity: number;
      dropShadow: boolean;
      showBlurredBg: boolean;
      bgType?: "default" | "blurred" | "custom";
      customBgImage?: string;
      screenshotTop?: number;
      screenshotHeight?: number;
      titleTop?: number;
      subtitleTop?: number;
      urlPillTop?: number;
    };

    if (!urls || urls.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    const outputDir = getOutputDir(batchName || coverTitle);

    // Save manifest.json in outputDir for tracking used/processed URLs
    try {
      const manifestFile = path.join(outputDir, "manifest.json");
      const manifestData = {
        batchName: batchName || coverTitle,
        createdAt: new Date().toISOString(),
        urls: urls.map((u) => u.trim()).filter(Boolean),
      };
      fs.writeFileSync(manifestFile, JSON.stringify(manifestData, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write output manifest:", e);
    }

    const sharedSettings = {
      topLeftText: topLeftText || process.env.BRAND_NAME || "@KOCHIKUKO",
      topRightText: topRightText || "",
      bottomLeftText: bottomLeftText || process.env.TAGLINE || "MADE WITH @INSTAS",
      bottomRightText: bottomRightText || "SAVE FOR LATER",
      bottomRightIcon: bottomRightIcon || "bookmark",
      fontFamily: fontFamily || "Inter",
      blurAmount: blurAmount ?? 12,
      borderRadius: borderRadius ?? 12,
      noiseOpacity: noiseOpacity ?? 0.04,
      dropShadow: dropShadow ?? true,
      showBlurredBg: showBlurredBg ?? false,
      bgType: bgType || "default",
      customBgImage: customBgImage || "",
      screenshotTop: screenshotTop ?? 240,
      screenshotHeight: screenshotHeight ?? 520,
      titleTop: titleTop ?? 790,
      subtitleTop: subtitleTop ?? 854,
      urlPillTop: urlPillTop ?? 940,
    };

    // Shared browser instance for 3-5x faster batch processing
    browser = await chromium.launch({ headless: true });

    const results: { filename: string; url?: string; error?: string }[] = [];

    // 1. Cover slide
    try {
      const coverParams: CompositeParams = {
        type: "cover",
        coverTitle,
        coverSubtitle,
        ...sharedSettings,
      };
      const coverBuf = await compositeSlide(coverParams, baseUrl, browser);
      const coverFile = "01_cover.png";
      savePng(coverBuf, outputDir, coverFile);
      results.push({ filename: coverFile });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ filename: "01_cover_error.png", error: `Cover slide failed: ${msg}` });
    }

    // 2. Content slides — scrape + composite sequentially
    for (let i = 0; i < urls.length; i++) {
      const rawUrl = urls[i].trim();
      if (!rawUrl) continue;

      const slideNumber = i + 1; // Content 1 = 01, Content 2 = 02

      let scraped;
      try {
        scraped = await scrapeUrl(rawUrl, browser);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({
          filename: `${String(slideNumber + 1).padStart(2, "0")}_error.png`,
          url: rawUrl,
          error: `Scrape error: ${msg}`,
        });
        continue;
      }

      try {
        const contentParams: CompositeParams = {
          type: "content",
          screenshotBase64: scraped.screenshotBase64,
          siteTitle: scraped.title,
          siteDescription: scraped.description,
          siteUrl: scraped.displayUrl,
          slideNumber: slideNumber,
          ...sharedSettings,
        };

        const contentBuf = await compositeSlide(contentParams, baseUrl, browser);
        const filename = `${String(slideNumber + 1).padStart(2, "0")}_content.png`;
        savePng(contentBuf, outputDir, filename);
        results.push({ filename, url: scraped.url, error: scraped.error });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({
          filename: `${String(slideNumber + 1).padStart(2, "0")}_error.png`,
          url: scraped.url,
          error: `Composite error: ${msg}`,
        });
      }
    }

    await browser.close();
    browser = undefined;

    return NextResponse.json({ outputDir, slides: results });
  } catch (err: unknown) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
