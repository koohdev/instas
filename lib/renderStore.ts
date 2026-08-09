import fs from "fs";
import path from "path";
import os from "os";

const TEMP_DIR = path.join(os.tmpdir(), "instascrape_cache");

export function saveRenderData(id: string, data: unknown): void {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  fs.writeFileSync(path.join(TEMP_DIR, `${id}.json`), JSON.stringify(data));
}

export function getRenderData(id: string): unknown {
  try {
    const filepath = path.join(TEMP_DIR, `${id}.json`);
    if (!fs.existsSync(filepath)) return null;
    const content = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function deleteRenderData(id: string): void {
  try {
    const filepath = path.join(TEMP_DIR, `${id}.json`);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch {
    // ignore cleanup errors
  }
}
