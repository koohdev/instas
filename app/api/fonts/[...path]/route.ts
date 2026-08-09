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

const SUPPORTED_EXTENSIONS = [".woff2", ".woff", ".ttf", ".otf", ".eot"];

const MIME_TYPES: Record<string, string> = {
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".eot": "application/vnd.ms-fontobject",
};

/**
 * Search for the best matching font file by family name.
 * Prefers Regular/Bold variants, then any file in the folder.
 */
function findFontFileByFamily(fontsDir: string, family: string): string | null {
  // Try exact folder match first
  const tryDirs = [family, family.replace(/\s+/g, ""), family.replace(/\s+/g, "-")];

  for (const dirName of tryDirs) {
    const dirPath = path.join(fontsDir, dirName);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      // Prefer woff2 > woff > ttf > otf, then prefer Regular variant
      const files = fs.readdirSync(dirPath);
      for (const ext of SUPPORTED_EXTENSIONS) {
        const regularFile = files.find(
          (f) =>
            f.toLowerCase().endsWith(ext) &&
            (f.toLowerCase().includes("regular") || f.toLowerCase().includes("medium") || !f.includes("-"))
        );
        if (regularFile) return path.join(dirPath, regularFile);
      }
      // Fallback: any supported font file
      for (const ext of SUPPORTED_EXTENSIONS) {
        const anyFile = files.find((f) => f.toLowerCase().endsWith(ext));
        if (anyFile) return path.join(dirPath, anyFile);
      }
    }
  }

  // Recursive scan: check if any subfolder contains the family string
  if (!fs.existsSync(fontsDir)) return null;
  const entries = fs.readdirSync(fontsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderName = entry.name.toLowerCase().replace(/\s+/g, "");
      const searchName = family.toLowerCase().replace(/\s+/g, "");
      if (folderName.includes(searchName) || searchName.includes(folderName)) {
        const found = findFontFileByFamily(path.join(fontsDir, entry.name), family);
        if (found) return found;
        // If still not found, try files directly in this folder
        const files = fs.readdirSync(path.join(fontsDir, entry.name));
        for (const ext of SUPPORTED_EXTENSIONS) {
          const anyFile = files.find((f) => f.toLowerCase().endsWith(ext));
          if (anyFile) return path.join(fontsDir, entry.name, anyFile);
        }
      }
    }
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const fontPathSegment = (resolvedParams.path || []).join("/");
    const decodedPath = decodeURIComponent(fontPathSegment);

    const fontsDir = getFontsDir();

    // First try direct file path
    const directPath = path.join(fontsDir, decodedPath);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      const ext = path.extname(directPath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || "application/octet-stream";
      const buffer = fs.readFileSync(directPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Second: treat the path as a font family name and search for the best match
    const familyFile = findFontFileByFamily(fontsDir, decodedPath);
    if (familyFile) {
      const ext = path.extname(familyFile).toLowerCase();
      const mimeType = MIME_TYPES[ext] || "application/octet-stream";
      const buffer = fs.readFileSync(familyFile);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return NextResponse.json({ error: "Font file not found", path: decodedPath }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
