import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getFontsDir(): string {
  const rootWorkspaceFontsDir = path.join(process.cwd(), "..", "fonts");
  if (fs.existsSync(rootWorkspaceFontsDir)) {
    return rootWorkspaceFontsDir;
  }
  const localFontsDir = path.join(process.cwd(), "data", "fonts");
  if (!fs.existsSync(localFontsDir)) {
    fs.mkdirSync(localFontsDir, { recursive: true });
  }
  return localFontsDir;
}

const SUPPORTED_EXTENSIONS = [".ttf", ".otf", ".woff", ".woff2", ".eot"];

const FORMAT_MAP: Record<string, string> = {
  ".ttf": "truetype",
  ".otf": "opentype",
  ".woff": "woff",
  ".woff2": "woff2",
  ".eot": "embedded-opentype",
};

export interface FontItem {
  id: string;
  filename: string;
  family: string;
  variant: string;
  format: string;
  relativePath: string;
  url: string;
  sizeBytes: number;
}

function scanFontsDir(dir: string, baseDir: string = dir): FontItem[] {
  let results: FontItem[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanFontsDir(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        const stats = fs.statSync(fullPath);

        // ─── Family = ALWAYS the direct parent folder name (cleaned) ───
        // This is the canonical source of truth used for @font-face injection.
        const parentFolder = path.basename(path.dirname(fullPath));
        const isRootLevel = parentFolder === path.basename(baseDir);

        // If the font sits at root level (no subfolder), derive from filename
        const rawFamily = isRootLevel ? path.parse(entry.name).name : parentFolder;

        // Humanize: split camelCase, remove dashes/underscores
        const cleanFamily = rawFamily
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/[-_]+/g, " ")
          .trim();

        // Detect variant from filename (Regular, Bold, Medium, Italic, etc.)
        const baseName = path.parse(entry.name).name;
        const variantMatch = baseName.match(/[-_](bold|medium|light|thin|semibold|extra|black|italic|regular|oblique)/i);
        const variant = variantMatch ? variantMatch[1] : "Regular";

        results.push({
          id: relPath,
          filename: entry.name,
          family: cleanFamily,
          variant: variant,
          format: FORMAT_MAP[ext] || "truetype",
          relativePath: relPath,
          url: `/api/fonts/${encodeURIComponent(relPath)}`,
          sizeBytes: stats.size,
        });
      }
    }
  }

  return results;
}

export async function GET() {
  try {
    const fontsDir = getFontsDir();
    const fonts = scanFontsDir(fontsDir);
    return NextResponse.json({ fonts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("folder") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported font file extension. Allowed: TTF, OTF, WOFF, WOFF2, EOT" },
        { status: 400 }
      );
    }

    const fontsDir = getFontsDir();
    const targetDir = subfolder ? path.join(fontsDir, subfolder) : fontsDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetPath, buffer);

    const relPath = path.relative(fontsDir, targetPath).replace(/\\/g, "/");

    return NextResponse.json({
      font: {
        id: relPath,
        filename: file.name,
        family: subfolder || path.parse(file.name).name,
        variant: "Regular",
        format: FORMAT_MAP[ext] || "truetype",
        relativePath: relPath,
        url: `/api/fonts/${encodeURIComponent(relPath)}`,
        sizeBytes: buffer.length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
