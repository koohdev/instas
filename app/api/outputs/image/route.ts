import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDesktopPath } from "@/lib/output";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const file = searchParams.get("file");

    if (!folder || !file) {
      return new Response("Missing folder or file parameter", { status: 400 });
    }

    const primaryRoot = getDesktopPath();
    let filePath = path.join(primaryRoot, folder, file);

    if (!fs.existsSync(filePath)) {
      const legacyRoot = primaryRoot.replace(/INSTAS$/, "InstaScrape");
      const legacyFilePath = path.join(legacyRoot, folder, file);
      if (fs.existsSync(legacyFilePath)) {
        filePath = legacyFilePath;
      }
    }

    if (!fs.existsSync(filePath)) {
      return new Response("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".webp") contentType = "image/webp";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
