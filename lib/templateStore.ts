import fs from "fs";
import path from "path";

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  activeTemplateId?: string;
  
  // Cover & Typography Settings
  coverTitle: string;
  coverSubtitle: string;
  coverStyle: "minimal" | "bold" | "modern";
  fontFamily?: string;
  
  // Visual & Background Settings
  blurAmount: number;
  borderRadius: number;
  noiseOpacity: number;
  dropShadow: boolean;
  showBlurredBg: boolean;
  bgType: "default" | "blurred" | "custom";
  customBgImage?: string;
  
  // Positioning Settings
  screenshotTop: number;
  screenshotHeight: number;
  titleTop: number;
  subtitleTop: number;
  urlPillTop: number;
  
  // Branding Settings
  topLeftText: string;
  topRightText: string;
  bottomLeftText: string;
  bottomRightText: string;
  bottomRightIcon: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");

export const DEFAULT_TEMPLATES: DesignTemplate[] = [
  {
    id: "tpl_default",
    name: "Standard Dark (Default)",
    description: "Sleek dark gradient background with 12px rounded cards and standard branding.",
    isDefault: true,
    
    coverTitle: "Stop making your own components",
    coverSubtitle: "A curated list of high-quality UI kits & design tools to copy and paste",
    coverStyle: "modern",
    
    blurAmount: 12,
    borderRadius: 12,
    noiseOpacity: 0.04,
    dropShadow: true,
    showBlurredBg: false,
    bgType: "default",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "RESOURCES",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  },
  {
    id: "tpl_glass",
    name: "Glassmorphism Ambient",
    description: "Immersive blurred backdrop with heavy glass radius.",
    
    coverTitle: "Websites that will inspire your next build",
    coverSubtitle: "Hand-picked award-winning portfolios and modern SaaS landing pages",
    coverStyle: "bold",
    
    blurAmount: 20,
    borderRadius: 18,
    noiseOpacity: 0.08,
    dropShadow: true,
    showBlurredBg: true,
    bgType: "blurred",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "CURATED",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  },
  {
    id: "tpl_minimal",
    name: "Stark Minimal",
    description: "High-contrast pure black layout with sharp corners.",
    
    coverTitle: "Essential Open Source Projects",
    coverSubtitle: "Powerful tools you can self-host today without subscriptions",
    coverStyle: "minimal",
    
    blurAmount: 0,
    borderRadius: 0,
    noiseOpacity: 0,
    dropShadow: false,
    showBlurredBg: false,
    bgType: "default",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "TOOLS & KITS",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  },
  {
    id: "tpl_ui_components",
    name: "UI Components Spotlight",
    description: "Teal burst texture with rounded 16px cards & clean component showcase layout.",
    
    coverTitle: "Production-Ready UI Components",
    coverSubtitle: "Copy-paste React & Tailwind primitives built for modern web apps",
    coverStyle: "modern",
    
    blurAmount: 14,
    borderRadius: 16,
    noiseOpacity: 0.05,
    dropShadow: true,
    showBlurredBg: false,
    bgType: "custom",
    customBgImage: "54-teal-burst-noise.jpg",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "UI COMPONENTS",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  },
  {
    id: "tpl_design_tools",
    name: "Design Tools & Assets",
    description: "Warm sunset ambient gradient paired with sleek glassmorphism.",
    
    coverTitle: "Top 10 Design Tools for 2026",
    coverSubtitle: "Supercharge your design workflow with AI tools, color palettes, & vector editors",
    coverStyle: "bold",
    
    blurAmount: 18,
    borderRadius: 20,
    noiseOpacity: 0.06,
    dropShadow: true,
    showBlurredBg: false,
    bgType: "custom",
    customBgImage: "56-warm-sunset-gradient.jpg",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "DESIGN TOOLS",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  },
  {
    id: "tpl_productivity",
    name: "Productivity Essentials",
    description: "Deep blue velvet background with sharp contrast and clean typography.",
    
    coverTitle: "Developer Productivity Essentials",
    coverSubtitle: "CLI tools, terminal setups, and automation scripts that save 10+ hours a week",
    coverStyle: "minimal",
    
    blurAmount: 10,
    borderRadius: 12,
    noiseOpacity: 0.04,
    dropShadow: true,
    showBlurredBg: false,
    bgType: "custom",
    customBgImage: "50-blue-velvet-light-reflection.jpg",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "PRODUCTIVITY",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  },
  {
    id: "tpl_inspiration",
    name: "Web Inspiration Showcase",
    description: "Cosmic red-orange glowing aura designed to grab instant attention on social feeds.",
    
    coverTitle: "Award-Winning Web Inspiration",
    coverSubtitle: "Mind-blowing 3D interactive web experiences and creative motion design",
    coverStyle: "modern",
    
    blurAmount: 24,
    borderRadius: 24,
    noiseOpacity: 0.08,
    dropShadow: true,
    showBlurredBg: false,
    bgType: "custom",
    customBgImage: "60-red-orange-cosmic-gradient.jpg",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "INSPIRATION",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  },
  {
    id: "tpl_resources",
    name: "UI Kits & Resources Roundup",
    description: "Vibrant purple glow background tailored for resource roundups and free download posts.",
    
    coverTitle: "Free Figma Kits & Icon Packs",
    coverSubtitle: "High quality open-source design systems and vector assets for your next client project",
    coverStyle: "bold",
    
    blurAmount: 16,
    borderRadius: 14,
    noiseOpacity: 0.05,
    dropShadow: true,
    showBlurredBg: false,
    bgType: "custom",
    customBgImage: "57-purple-horizontal-glow.jpg",
    
    screenshotTop: 240,
    screenshotHeight: 520,
    titleTop: 790,
    subtitleTop: 854,
    urlPillTop: 940,
    
    topLeftText: "@KOCHIKUKO",
    topRightText: "RESOURCES",
    bottomLeftText: "MADE WITH @INSTAS",
    bottomRightText: "SAVE FOR LATER",
    bottomRightIcon: "bookmark",
  }
];

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadTemplates(): DesignTemplate[] {
  ensureDataDir();
  if (!fs.existsSync(TEMPLATES_FILE)) {
    saveTemplates(DEFAULT_TEMPLATES);
    return DEFAULT_TEMPLATES;
  }
  try {
    const raw = fs.readFileSync(TEMPLATES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(templates: DesignTemplate[]): void {
  ensureDataDir();
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), "utf-8");
}
