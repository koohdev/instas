import fs from "fs";
import path from "path";

export interface SavedUrlItem {
  id: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
  createdAt: string;
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

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadUrlLibrary(): SavedUrlItem[] {
  ensureDataDir();
  if (!fs.existsSync(URL_LIBRARY_FILE)) {
    saveUrlLibrary(DEFAULT_SAVED_URLS);
    return DEFAULT_SAVED_URLS;
  }
  try {
    const raw = fs.readFileSync(URL_LIBRARY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SAVED_URLS;
  } catch {
    return DEFAULT_SAVED_URLS;
  }
}

export function saveUrlLibrary(items: SavedUrlItem[]): void {
  ensureDataDir();
  fs.writeFileSync(URL_LIBRARY_FILE, JSON.stringify(items, null, 2), "utf-8");
}
