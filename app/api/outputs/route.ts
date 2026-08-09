import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDesktopPath } from "@/lib/output";

export interface OutputItemMetadata {
  status: "not_posted" | "posted" | "scheduled";
  scheduledDate?: string;
  notes?: string;
  category?: string;
  customTitle?: string;
}

export interface OutputBatchItem {
  folderName: string;
  title: string;
  folderPath: string;
  createdAt: string;
  status: "not_posted" | "posted" | "scheduled";
  scheduledDate?: string;
  notes?: string;
  category?: string;
  slideCount: number;
  slides: string[];
  coverImage?: string;
  totalSizeBytes: number;
}

const METADATA_FILE = path.join(process.cwd(), "data", "outputs_metadata.json");

function readMetadataStore(): Record<string, OutputItemMetadata> {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const content = fs.readFileSync(METADATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {}
  return {};
}

function writeMetadataStore(data: Record<string, OutputItemMetadata>) {
  try {
    const dir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to save outputs metadata store:", err);
  }
}

function getPossibleOutputRoots(): string[] {
  const primary = getDesktopPath();
  const roots = [primary];
  const legacy = primary.replace(/INSTAS$/, "InstaScrape");
  if (fs.existsSync(legacy) && legacy !== primary) {
    roots.push(legacy);
  }
  return roots;
}

export async function GET() {
  try {
    const primaryRoot = getDesktopPath();
    if (!fs.existsSync(primaryRoot)) {
      fs.mkdirSync(primaryRoot, { recursive: true });
    }

    const metadataMap = readMetadataStore();
    const roots = getPossibleOutputRoots();
    const batches: OutputBatchItem[] = [];
    const usedUrlsSet = new Set<string>();

    for (const outputRoot of roots) {
      if (!fs.existsSync(outputRoot)) continue;
      const entries = fs.readdirSync(outputRoot, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const folderName = entry.name;
        const fullPath = path.join(outputRoot, folderName);

      try {
        const stats = fs.statSync(fullPath);
        const files = fs.readdirSync(fullPath);

        const pngFiles = files
          .filter((f) => f.toLowerCase().endsWith(".png"))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        if (pngFiles.length === 0) continue;

        // Try reading manifest.json for tracked target URLs
        const manifestPath = path.join(fullPath, "manifest.json");
        if (fs.existsSync(manifestPath)) {
          try {
            const manifestRaw = fs.readFileSync(manifestPath, "utf-8");
            const manifestObj = JSON.parse(manifestRaw);
            if (Array.isArray(manifestObj.urls)) {
              for (const u of manifestObj.urls) {
                if (typeof u === "string" && u.trim()) {
                  usedUrlsSet.add(u.trim());
                }
              }
            }
          } catch {}
        }

        let totalSizeBytes = 0;
        for (const file of files) {
          try {
            const fStat = fs.statSync(path.join(fullPath, file));
            totalSizeBytes += fStat.size;
          } catch {}
        }

        // Format clean title from folderName (e.g., "2026-08-09_new-design2_23-28" -> "new design2")
        let title = folderName;
        const parts = folderName.split("_");
        if (parts.length >= 3) {
          // Date is parts[0], slug is parts[1..n-1], time is parts[n-1]
          const slugParts = parts.slice(1, -1);
          if (slugParts.length > 0) {
            title = slugParts.join(" ").replace(/-/g, " ");
          }
        } else if (parts.length === 2) {
          title = parts[1].replace(/-/g, " ");
        }

        // Capitalize title
        title = title.replace(/\b\w/g, (l) => l.toUpperCase());

        const savedMeta = metadataMap[folderName] || {};
        const coverImage = pngFiles[0];

        batches.push({
          folderName,
          title: savedMeta.customTitle || title,
          folderPath: fullPath,
          createdAt: stats.birthtime ? stats.birthtime.toISOString() : stats.mtime.toISOString(),
          status: savedMeta.status || "not_posted",
          scheduledDate: savedMeta.scheduledDate || "",
          notes: savedMeta.notes || "",
          category: savedMeta.category || "Carousel",
          slideCount: pngFiles.length,
          slides: pngFiles,
          coverImage,
          totalSizeBytes,
        });
      } catch (err) {
        console.error(`Error processing output folder ${folderName}:`, err);
      }
    }
    }

    // Sort newest created first
    batches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, outputs: batches, usedUrls: Array.from(usedUrlsSet) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { folderName, status, scheduledDate, notes, customTitle, category } = body;

    if (!folderName) {
      return NextResponse.json({ success: false, error: "folderName is required" }, { status: 400 });
    }

    const metadataMap = readMetadataStore();
    const existing = metadataMap[folderName] || { status: "not_posted" };

    if (status !== undefined) existing.status = status;
    if (scheduledDate !== undefined) existing.scheduledDate = scheduledDate;
    if (notes !== undefined) existing.notes = notes;
    if (customTitle !== undefined) existing.customTitle = customTitle;
    if (category !== undefined) existing.category = category;

    metadataMap[folderName] = existing;
    writeMetadataStore(metadataMap);

    return NextResponse.json({ success: true, item: existing });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderName = searchParams.get("folderName");

    if (!folderName) {
      return NextResponse.json({ success: false, error: "folderName parameter is required" }, { status: 400 });
    }

    const outputRoot = getDesktopPath();
    const targetDir = path.join(outputRoot, folderName);

    // Prevent directory traversal attacks
    if (!targetDir.startsWith(outputRoot)) {
      return NextResponse.json({ success: false, error: "Invalid folder path" }, { status: 403 });
    }

    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    // Remove from metadata store
    const metadataMap = readMetadataStore();
    if (metadataMap[folderName]) {
      delete metadataMap[folderName];
      writeMetadataStore(metadataMap);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
