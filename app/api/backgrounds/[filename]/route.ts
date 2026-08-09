import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function findBgFilePath(filename: string): string | null {
  const safeFilename = path.basename(filename);

  // 1. Check root workspace /backgrounds
  const rootWorkspaceBgDir = path.join(process.cwd(), "..", "backgrounds");
  const rootFilePath = path.join(rootWorkspaceBgDir, safeFilename);
  if (fs.existsSync(rootFilePath)) {
    return rootFilePath;
  }

  // 2. Check local instascrape/data/backgrounds
  const localBgDir = path.join(process.cwd(), "data", "backgrounds");
  const localFilePath = path.join(localBgDir, safeFilename);
  if (fs.existsSync(localFilePath)) {
    return localFilePath;
  }

  return null;
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    let decodedFilename = filename;
    try {
      decodedFilename = decodeURIComponent(filename);
    } catch {
      // ignore
    }

    const filePath = findBgFilePath(decodedFilename) || findBgFilePath(filename);

    if (!filePath) {
      return NextResponse.json({ error: "Background image not found" }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(fileBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
