import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getBackgroundsDir(): string {
  const rootWorkspaceBgDir = path.join(process.cwd(), "..", "backgrounds");
  if (fs.existsSync(rootWorkspaceBgDir)) {
    return rootWorkspaceBgDir;
  }
  const localBgDir = path.join(process.cwd(), "data", "backgrounds");
  if (!fs.existsSync(localBgDir)) {
    fs.mkdirSync(localBgDir, { recursive: true });
  }
  return localBgDir;
}

const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export interface BackgroundItem {
  id: string;
  filename: string;
  name: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export async function GET() {
  try {
    const bgDir = getBackgroundsDir();
    if (!fs.existsSync(bgDir)) {
      return NextResponse.json({ backgrounds: [] });
    }

    const files = fs.readdirSync(bgDir);
    const backgrounds: BackgroundItem[] = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .map((file) => {
        const filePath = path.join(bgDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const mimeType = MIME_TYPES[ext] || "image/png";

        // Read file as Base64 Data URL to guarantee zero 404/500 image load errors
        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const nameWithoutExt = path.parse(file).name;
        const cleanName = nameWithoutExt
          .replace(/^[0-9]+[-_]?/, "")
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return {
          id: file,
          filename: file,
          name: cleanName || file,
          sizeBytes: stats.size,
          url: dataUrl, // Instant base64 data URL
          createdAt: stats.birthtime.toISOString(),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ backgrounds });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file extension. Allowed: PNG, JPG, JPEG, WEBP, GIF, SVG" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bgDir = getBackgroundsDir();
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `${Date.now()}_${sanitizedOriginal}`;
    const filePath = path.join(bgDir, filename);

    fs.writeFileSync(filePath, buffer);

    const stats = fs.statSync(filePath);
    const mimeType = MIME_TYPES[ext] || "image/png";
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const nameWithoutExt = path.parse(filename).name.replace(/^[0-9]+_/, "");
    const cleanName = nameWithoutExt
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const newBg: BackgroundItem = {
      id: filename,
      filename: filename,
      name: cleanName,
      sizeBytes: stats.size,
      url: dataUrl,
      createdAt: stats.birthtime.toISOString(),
    };

    return NextResponse.json({ success: true, background: newBg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const bgDir = getBackgroundsDir();
    const filePath = path.join(bgDir, path.basename(filename));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
