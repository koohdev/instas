import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import zlib from "zlib";

function getDesktopPath() {
  const homeDir = process.env.USERPROFILE || process.env.HOME || "C:\\Users\\kochi";
  return path.join(homeDir, "Desktop", "INSTAS");
}

function getPossibleOutputRoots() {
  const primary = getDesktopPath();
  const roots = [primary];
  const homeDir = process.env.USERPROFILE || process.env.HOME || "C:\\Users\\kochi";
  const OneDriveDesktop = path.join(homeDir, "OneDrive", "Desktop", "INSTAS");
  if (OneDriveDesktop !== primary) {
    roots.push(OneDriveDesktop);
  }
  return roots;
}


interface ZipFileItem {
  filename: string;
  buffer: Buffer;
}

function buildZipArchive(files: ZipFileItem[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralDirs: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const filenameBuf = Buffer.from(file.filename, "utf-8");
    const uncompressedData = file.buffer;
    // Use C++ zlib.crc32 for 100% bit-exact IEEE 802.3 CRC-32 checksums
    const crc = zlib.crc32(uncompressedData);

    const method = 0; // Store (no compression - perfect for pre-compressed PNG image files)
    const compLen = uncompressedData.length;
    const uncompLen = uncompressedData.length;

    // Local Header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + filenameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4); // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6); // General flags
    localHeader.writeUInt16LE(method, 8); // Method 0 (Store)
    localHeader.writeUInt16LE(0, 10); // Mod time
    localHeader.writeUInt16LE(0, 12); // Mod date
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compLen, 18);
    localHeader.writeUInt32LE(uncompLen, 22);
    localHeader.writeUInt16LE(filenameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // Extra len
    filenameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, uncompressedData);

    // Central Directory Record (46 bytes + filename)
    const centralHeader = Buffer.alloc(46 + filenameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Signature
    centralHeader.writeUInt16LE(20, 4); // Made by (2.0)
    centralHeader.writeUInt16LE(20, 6); // Version needed (2.0)
    centralHeader.writeUInt16LE(0, 8); // General flags
    centralHeader.writeUInt16LE(method, 10); // Method 0 (Store)
    centralHeader.writeUInt16LE(0, 12); // Mod time
    centralHeader.writeUInt16LE(0, 14); // Mod date
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compLen, 20);
    centralHeader.writeUInt32LE(uncompLen, 24);
    centralHeader.writeUInt16LE(filenameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // Extra len
    centralHeader.writeUInt16LE(0, 32); // Comment len
    centralHeader.writeUInt16LE(0, 34); // Disk start
    centralHeader.writeUInt16LE(0, 36); // Int attrs
    centralHeader.writeUInt32LE(0, 38); // Ext attrs
    centralHeader.writeUInt32LE(offset, 42); // Offset
    filenameBuf.copy(centralHeader, 46);

    centralDirs.push(centralHeader);

    offset += localHeader.length + uncompressedData.length;
  }

  const centralDirOffset = offset;
  const centralDirSize = centralDirs.reduce((sum, b) => sum + b.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // Signature
  eocd.writeUInt16LE(0, 4); // Disk num
  eocd.writeUInt16LE(0, 6); // Start disk
  eocd.writeUInt16LE(files.length, 8); // Num records on disk
  eocd.writeUInt16LE(files.length, 10); // Total num records
  eocd.writeUInt32LE(centralDirSize, 12); // Central dir size
  eocd.writeUInt32LE(centralDirOffset, 16); // Central dir offset
  eocd.writeUInt16LE(0, 20); // Comment len

  return Buffer.concat([...localHeaders, ...centralDirs, eocd]);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderName = searchParams.get("folder");

    if (!folderName) {
      return NextResponse.json({ error: "Missing folder parameter" }, { status: 400 });
    }

    const roots = getPossibleOutputRoots();
    const filesToZip: ZipFileItem[] = [];
    let archiveTitle = folderName;

    if (folderName === "all") {
      archiveTitle = "all_instascrape_carousel_outputs";
      for (const root of roots) {
        if (!fs.existsSync(/*turbopackIgnore: true*/ root)) continue;
        const entries = fs.readdirSync(/*turbopackIgnore: true*/ root, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const subFolderPath = path.join(root, entry.name);
          const fStat = fs.readdirSync(/*turbopackIgnore: true*/ subFolderPath);
          const pngs = fStat.filter((f) => f.toLowerCase().endsWith(".png"));
          for (const pngFile of pngs) {
            const fullFilePath = path.join(subFolderPath, pngFile);
            const content = fs.readFileSync(/*turbopackIgnore: true*/ fullFilePath);
            filesToZip.push({
              filename: `${entry.name}/${pngFile}`,
              buffer: content,
            });
          }
        }
      }
    } else {
      let targetFolderPath: string | null = null;
      for (const root of roots) {
        const checkPath = path.join(root, folderName);
        if (fs.existsSync(/*turbopackIgnore: true*/ checkPath) && fs.statSync(/*turbopackIgnore: true*/ checkPath).isDirectory()) {
          targetFolderPath = checkPath;
          break;
        }
      }

      if (!targetFolderPath) {
        return NextResponse.json({ error: `Folder '${folderName}' not found` }, { status: 404 });
      }

      const dirFiles = fs.readdirSync(/*turbopackIgnore: true*/ targetFolderPath);
      const pngFiles = dirFiles
        .filter((f) => f.toLowerCase().endsWith(".png"))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      if (pngFiles.length === 0) {
        return NextResponse.json({ error: "No PNG slides found in folder" }, { status: 404 });
      }

      for (const pngFile of pngFiles) {
        const fullFilePath = path.join(/*turbopackIgnore: true*/ targetFolderPath, pngFile);
        const content = fs.readFileSync(/*turbopackIgnore: true*/ fullFilePath);
        filesToZip.push({
          filename: pngFile,
          buffer: content,
        });
      }
    }

    if (filesToZip.length === 0) {
      return NextResponse.json({ error: "No slides found to package" }, { status: 404 });
    }

    const zipBuffer = buildZipArchive(filesToZip);

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archiveTitle}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create ZIP download";
    console.error("ZIP Generation error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
