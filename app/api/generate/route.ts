import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { scrapeUrl } from "@/lib/scraper";
import { compositeSlide, CompositeParams } from "@/lib/compositor";
import { getOutputDir, savePng } from "@/lib/output";
import type { AspectRatio } from "@/lib/types";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/types";

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
      aspectRatio,
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
      cardOuterBg,
      cardPadding,
      cardBorderRadius,
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
      aspectRatio?: AspectRatio;
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
      cardOuterBg?: string;
      cardPadding?: number;
      cardBorderRadius?: number;
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
      cardOuterBg: cardOuterBg || "#0C1014",
      cardPadding: cardPadding ?? 40,
      cardBorderRadius: cardBorderRadius ?? 28,
      screenshotTop: screenshotTop ?? 240,
      screenshotHeight: screenshotHeight ?? 520,
      titleTop: titleTop ?? 790,
      subtitleTop: subtitleTop ?? 854,
      urlPillTop: urlPillTop ?? 940,
      aspectRatio: aspectRatio ?? "4:5",
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

    // LinkedIn PDF: render all slides into a single PDF using Playwright
    let pdfPath: string | undefined;
    if (aspectRatio === "linkedin-pdf") {
      try {
        const pdfBrowser = await chromium.launch({ headless: true });
        const dims = ASPECT_RATIO_DIMENSIONS["linkedin-pdf"];
        const pdfContext = await pdfBrowser.newContext({ viewport: { width: dims.width, height: dims.height } });
        const pdfPage = await pdfContext.newPage();
        const pdfFilename = `${(batchName || coverTitle || "carousel").replace(/[^a-z0-9_-]/gi, "_")}.pdf`;
        pdfPath = path.join(outputDir, pdfFilename);

        // Build a multi-page HTML document containing all slides
        const slideHtml = results
          .filter((r) => !r.error)
          .map((r) => {
            const imgPath = path.join(outputDir, r.filename);
            if (!fs.existsSync(imgPath)) return "";
            const base64 = fs.readFileSync(imgPath).toString("base64");
            return `<div style="width:${dims.width}px;height:${dims.height}px;page-break-after:always;overflow:hidden;"><img src="data:image/png;base64,${base64}" style="width:100%;height:100%;object-fit:cover;"/></div>`;
          })
          .join("");

        await pdfPage.setContent(`<html><body style="margin:0;padding:0;">${slideHtml}</body></html>`, { waitUntil: "networkidle" });
        const pdfBuf = await pdfPage.pdf({
          width: `${dims.width}px`,
          height: `${dims.height}px`,
          printBackground: true,
        });
        fs.writeFileSync(pdfPath, pdfBuf);
        await pdfContext.close();
        await pdfBrowser.close();
      } catch (pdfErr: unknown) {
        console.error("PDF generation error:", pdfErr);
      }
    }

    return NextResponse.json({ outputDir, slides: results, pdfPath });
  } catch (err: unknown) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
