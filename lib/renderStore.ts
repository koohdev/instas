import { promises as fsPromises } from "fs";
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
