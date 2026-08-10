/**
 * Shared strict TypeScript interfaces for instascrape.
 * Single source of truth replacing scattered `any` casts across studio components,
 * scraped metadata, and compositor params.
 */

// ---------------------------------------------------------------------------
// Aspect Ratio & Dimensions
// ---------------------------------------------------------------------------

export type AspectRatio = "4:5" | "1:1" | "9:16" | "16:9" | "linkedin-pdf";

export interface DimensionMap {
  width: number;
  height: number;
}

/**
 * Pixel dimensions for each export format.
 * Used by compositor (Playwright viewport) and render page.
 */
export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, DimensionMap> = {
  "4:5":          { width: 1080, height: 1350 },
  "1:1":          { width: 1080, height: 1080 },
  "9:16":         { width: 1080, height: 1920 },
  "16:9":         { width: 1920, height: 1080 },
  "linkedin-pdf": { width: 1080, height: 1350 }, // same canvas as 4:5, exported as PDF
};

/**
 * Default layout offsets per aspect ratio.
 * Auto-applied when the user switches formats so typography reflows correctly.
 */
export const ASPECT_RATIO_LAYOUT_PRESETS: Record<
  AspectRatio,
  {
    screenshotTop: number;
    screenshotHeight: number;
    titleTop: number;
    subtitleTop: number;
    urlPillTop: number;
  }
> = {
  "4:5": {
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
  },
  "linkedin-pdf": {
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
  },
  "1:1": {
    screenshotTop: 180,
    screenshotHeight: 440,
    titleTop: 650,
    subtitleTop: 710,
    urlPillTop: 790,
  },
  "9:16": {
    screenshotTop: 300,
    screenshotHeight: 640,
    titleTop: 1000,
    subtitleTop: 1080,
    urlPillTop: 1200,
  },
  "16:9": {
    screenshotTop: 140,
    screenshotHeight: 360,
    titleTop: 550,
    subtitleTop: 610,
    urlPillTop: 690,
  },
};

// ---------------------------------------------------------------------------
// Batch Queue
// ---------------------------------------------------------------------------

export interface CategoryWatcher {
  id: string;
  category: string;
  threshold: number;
  templateId: string;
}

export interface BatchQueueItem {
  id: string;
  /** Grouped list of URLs forming one carousel (cover + N content slides). */
  urls: string[];
  batchName: string;
  status: "pending" | "running" | "done" | "error";
  result?: GenerateResult;
  errorMsg?: string;
  createdAt: string;
  templateId?: string;
}

// ---------------------------------------------------------------------------
// Generation Result (re-exported here so other modules import from one place)
// ---------------------------------------------------------------------------

export interface GenerateResult {
  outputDir: string;
  slides: SlideResult[];
  pdfPath?: string; // only present for linkedin-pdf format
}

export interface SlideResult {
  filename: string;
  url?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Scraped Metadata
// ---------------------------------------------------------------------------

export interface ScrapedMetadata {
  url: string;
  displayUrl: string;
  title: string;
  description: string;
  screenshotBase64: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Generation Request Body (strictly typed, replaces `any` in route handlers)
// ---------------------------------------------------------------------------

export interface GenerateRequestBody {
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
  screenshotTop?: number;
  screenshotHeight?: number;
  titleTop?: number;
  subtitleTop?: number;
  urlPillTop?: number;
}
