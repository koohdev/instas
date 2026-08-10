import crypto from "crypto";
import { getOutputDir, savePng } from "./output";
import { compositeSlide, getSharedBrowser, CompositeParams } from "./compositor";
import { scrapeUrl } from "./scraper";
import fs from "fs";
import path from "path";

export interface BatchJob {
  id: string;
  batchName: string;
  urls: string[];
  settings: Record<string, any>;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number; // 0 to 100
  currentStep?: string;
  outputDir?: string;
  slideCount: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// In-memory queue store (persisted in global space)
const jobsMap = new Map<string, BatchJob>();
let isQueueRunning = false;

export function enqueueJob(batchName: string, urls: string[], settings: Record<string, any>): BatchJob {
  const id = `job_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const job: BatchJob = {
    id,
    batchName: batchName || settings.coverTitle || "Untitled Batch",
    urls: urls.map((u) => u.trim()).filter(Boolean),
    settings,
    status: "queued",
    progress: 0,
    currentStep: "Enqueued in background worker queue",
    slideCount: urls.length + 1, // Cover + Content slides
    createdAt: new Date().toISOString(),
  };

  jobsMap.set(id, job);
  triggerQueueProcessing();
  return job;
}

export function getJob(id: string): BatchJob | undefined {
  return jobsMap.get(id);
}

export function getAllJobs(): BatchJob[] {
  return Array.from(jobsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function triggerQueueProcessing(baseUrl = "http://localhost:3000") {
  if (isQueueRunning) return;
  isQueueRunning = true;

  // Process asynchronously without blocking
  (async () => {
    try {
      while (true) {
        // Find next queued job
        const queuedJob = Array.from(jobsMap.values()).find((j) => j.status === "queued");
        if (!queuedJob) break;

        await processJob(queuedJob, baseUrl);
      }
    } finally {
      isQueueRunning = false;
    }
  })();
}

async function processJob(job: BatchJob, baseUrl: string) {
  job.status = "processing";
  job.progress = 5;
  job.currentStep = "Initializing renderer and output directory...";

  try {
    const outputDir = getOutputDir(job.batchName);
    job.outputDir = outputDir;

    // Save manifest.json in output directory
    try {
      const manifestFile = path.join(outputDir, "manifest.json");
      const manifestData = {
        batchName: job.batchName,
        createdAt: new Date().toISOString(),
        urls: job.urls,
      };
      fs.writeFileSync(manifestFile, JSON.stringify(manifestData, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write manifest:", e);
    }

    const browser = await getSharedBrowser();
    const totalItems = job.urls.length + 1; // Cover + content

    const defaultVisualSettings = {
      blurAmount: 12,
      borderRadius: 12,
      noiseOpacity: 0.04,
      dropShadow: true,
      showBlurredBg: false,
      bgType: "default" as const,
      customBgImage: "",
      cardOuterBg: "#0C1014",
      cardPadding: 40,
      cardBorderRadius: 28,
      screenshotTop: 240,
      screenshotHeight: 520,
      titleTop: 790,
      subtitleTop: 854,
      urlPillTop: 940,
      aspectRatio: "4:5" as const,
    };

    // 1. Cover slide
    job.currentStep = "Rendering Cover Slide...";
    const coverParams: CompositeParams = {
      type: "cover",
      coverTitle: job.settings.coverTitle,
      coverSubtitle: job.settings.coverSubtitle,
      ...defaultVisualSettings,
      ...job.settings,
    };

    const coverBuf = await compositeSlide(coverParams, baseUrl, browser);
    savePng(coverBuf, outputDir, "01_cover.png");
    job.progress = Math.round((1 / totalItems) * 100);

    // 2. Content slides
    for (let i = 0; i < job.urls.length; i++) {
      const rawUrl = job.urls[i];
      const slideNum = i + 2;
      const numStr = String(slideNum).padStart(2, "0");
      const fileName = `${numStr}_slide.png`;

      job.currentStep = `Scraping & Rendering Slide ${slideNum}/${totalItems} (${rawUrl})...`;

      try {
        const scrapeResult = await scrapeUrl(rawUrl, browser);
        const contentParams: CompositeParams = {
          type: "content",
          screenshotBase64: scrapeResult.screenshotBase64,
          siteTitle: scrapeResult.title,
          siteDescription: scrapeResult.description,
          siteUrl: scrapeResult.url,
          slideNumber: slideNum,
          ...defaultVisualSettings,
          ...job.settings,
        };

        const slideBuf = await compositeSlide(contentParams, baseUrl, browser);
        savePng(slideBuf, outputDir, fileName);
      } catch (err: any) {
        console.error(`Failed to process slide ${slideNum}:`, err);
      }

      job.progress = Math.round(((i + 2) / totalItems) * 100);
    }

    job.status = "completed";
    job.progress = 100;
    job.currentStep = "Batch completed successfully!";
    job.completedAt = new Date().toISOString();
  } catch (err: any) {
    job.status = "failed";
    job.error = err?.message || String(err);
    job.currentStep = "Batch processing failed.";
  }
}
