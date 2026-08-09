import path from "path";
import os from "os";
import fs from "fs";

export function getDesktopPath(): string {
  if (process.env.OUTPUT_ROOT) return process.env.OUTPUT_ROOT;

  const home = os.homedir();
  const oneDriveDesktop = path.join(home, "OneDrive", "Desktop");
  const standardDesktop = path.join(home, "Desktop");
  const desktopDir = fs.existsSync(oneDriveDesktop) ? oneDriveDesktop : standardDesktop;

  return path.join(desktopDir, "INSTAS");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getOutputDir(batchName?: string): string {
  const root = getDesktopPath();

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
  const timeSuffix = `${pad(now.getHours())}-${pad(now.getMinutes())}`;

  let folderTitle = timeSuffix;
  if (batchName && batchName.trim()) {
    const slug = slugify(batchName.trim()).slice(0, 40);
    if (slug) {
      folderTitle = `${slug}_${timeSuffix}`;
    }
  }

  const dirName = `${datePrefix}_${folderTitle}`;
  const dir = path.join(root, dirName);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function savePng(buffer: Buffer, dir: string, filename: string): string {
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}
