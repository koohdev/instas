import fs, { promises as fsPromises } from "fs";
import path from "path";
import os from "os";

const TEMP_DIR = path.join(os.tmpdir(), "instascrape_cache");

export async function saveRenderData(id: string, data: unknown): Promise<void> {
  await fsPromises.mkdir(TEMP_DIR, { recursive: true });
  await fsPromises.writeFile(path.join(TEMP_DIR, `${id}.json`), JSON.stringify(data));
}

export async function getRenderData(id: string): Promise<unknown> {
  try {
    const filepath = path.join(TEMP_DIR, `${id}.json`);
    try {
      await fsPromises.access(filepath);
    } catch {
      return null;
    }
    const content = await fsPromises.readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function deleteRenderData(id: string): Promise<void> {
  try {
    const filepath = path.join(TEMP_DIR, `${id}.json`);
    try {
      await fsPromises.access(filepath);
      await fsPromises.unlink(filepath);
    } catch {
      // file might not exist, which is fine
    }
  } catch {
    // ignore cleanup errors
  }
}

export function cleanupTempFiles(): void {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      // Safety check: Our app only generates UUID v4 filenames for temp files
      // e.g., 123e4567-e89b-12d3-a456-426614174000.json
      const filenameWithoutExt = file.replace('.json', '');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(filenameWithoutExt)) {
        continue; // Skip files that don't match our strict UUID pattern
      }

      const filepath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filepath);
      if (now - stats.mtimeMs > ONE_HOUR) {
        fs.unlinkSync(filepath);
      }
    }
  } catch {
    // ignore cleanup errors
  }
}
