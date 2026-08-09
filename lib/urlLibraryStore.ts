import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

export interface SavedUrlItem {
  id: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
  createdAt: string;
  status?: "pending" | "processed";
}

const DATA_DIR = path.join(process.cwd(), "data");
const URL_LIBRARY_FILE = path.join(DATA_DIR, "url_library.json");

const DEFAULT_SAVED_URLS: SavedUrlItem[] = [
  {
    id: "url_01",
    url: "https://reactbits.dev",
    title: "React Bits",
    category: "UI Components",
    tags: ["React", "UI", "Open Source"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "url_02",
    url: "https://framer.com",
    title: "Framer",
    category: "Design Tools",
    tags: ["Design", "Prototyping", "Websites"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "url_03",
    url: "https://linear.app",
    title: "Linear",
    category: "Productivity",
    tags: ["Issue Tracker", "SaaS", "UX"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "url_04",
    url: "https://inspoai.io",
    title: "Inspo AI",
    category: "Inspiration",
    tags: ["AI", "Design", "Inspiration"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "url_05",
    url: "https://craftwork.design",
    title: "Craftwork",
    category: "UI Kits",
    tags: ["Figma", "UI Kits", "Mockups"],
    createdAt: new Date().toISOString(),
  },
];

async function ensureDataDir(): Promise<void> {
  try {
    await fsPromises.access(DATA_DIR);
  } catch {
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function loadUrlLibrary(): Promise<SavedUrlItem[]> {
  await ensureDataDir();
  try {
    await fsPromises.access(URL_LIBRARY_FILE);
  } catch {
    await saveUrlLibrary(DEFAULT_SAVED_URLS);
    return DEFAULT_SAVED_URLS;
  }

  try {
    const raw = await fsPromises.readFile(URL_LIBRARY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SAVED_URLS;
  } catch {
    return DEFAULT_SAVED_URLS;
  }
}

export async function saveUrlLibrary(items: SavedUrlItem[]): Promise<void> {
  await ensureDataDir();
  await fsPromises.writeFile(URL_LIBRARY_FILE, JSON.stringify(items, null, 2), "utf-8");
}
