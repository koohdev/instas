import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DesignTemplate } from "@/lib/templateStore";
import type { SavedUrlItem } from "@/lib/urlLibraryStore";
import type { BackgroundItem } from "@/app/api/backgrounds/route";
import type { FontItem } from "@/app/api/fonts/route";
import type { AspectRatio, BatchQueueItem } from "@/lib/types";
import { ASPECT_RATIO_LAYOUT_PRESETS } from "@/lib/types";

// The settings state that the configurator modifies live
export type ActiveSettings = Omit<DesignTemplate, "id" | "name" | "description" | "isDefault">;

function injectFontFaceRules(fonts: FontItem[], currentFontFamily?: string): string | null {
  if (typeof document === "undefined") return null;

  let styleEl = document.getElementById("custom-fonts-style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "custom-fonts-style";
    document.head.appendChild(styleEl);
  }

  // --- Group fonts by family, sort by format preference (woff2 > woff > ttf > otf) ---
  const FORMAT_PREF: Record<string, number> = { woff2: 0, woff: 1, truetype: 2, opentype: 3 };
  const familyGroups: Map<string, FontItem[]> = new Map();
  for (const f of fonts) {
    if (!familyGroups.has(f.family)) familyGroups.set(f.family, []);
    familyGroups.get(f.family)!.push(f);
  }

  const cssRules: string[] = [];
  const allNames = new Set<string>(); // all canonical family names + aliases

  for (const [family, items] of familyGroups) {
    const sorted = [...items].sort((a, b) =>
      (FORMAT_PREF[a.format] ?? 9) - (FORMAT_PREF[b.format] ?? 9)
    );
    const srcs = sorted
      .map((i) => `url('${i.url}') format('${i.format}')`)
      .join(",\n       ");

    allNames.add(family);

    // --- Canonical @font-face with full folder name ---
    cssRules.push(`@font-face {
  font-family: '${family}';
  src: ${srcs};
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}`);

    // --- Alias: also register the FIRST WORD as shorthand (e.g. "Nothing" for "Nothing font Ndroid Os") ---
    const firstWord = family.split(" ")[0];
    if (firstWord && firstWord !== family) {
      allNames.add(firstWord);
      cssRules.push(`@font-face {
  font-family: '${firstWord}';
  src: ${srcs};
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}`);
    }
  }

  styleEl.textContent = cssRules.join("\n\n");

  // --- Return the normalised family name for the current selection, or null if unknown ---
  if (currentFontFamily && currentFontFamily !== "Inter") {
    if (!allNames.has(currentFontFamily)) {
      // Try to find a family that starts with or matches the stored name
      for (const name of allNames) {
        if (
          name.toLowerCase().startsWith(currentFontFamily.toLowerCase()) ||
          currentFontFamily.toLowerCase().startsWith(name.split(" ")[0].toLowerCase())
        ) {
          return name; // return the canonical name to update the store
        }
      }
      return "Inter"; // no match found → reset to system default
    }
  }
  return null; // no change needed
}

export interface GenerateResult {
  outputDir: string;
  slides: { filename: string; url?: string; error?: string }[];
  pdfPath?: string;
}

interface AppState {
  // Global Fetched Lists
  templates: DesignTemplate[];
  savedUrls: SavedUrlItem[];
  backgroundList: BackgroundItem[];
  fontList: FontItem[];
  usedUrls: string[];

  // Global Generation Engine State
  generationStatus: "idle" | "loading" | "success" | "error";
  generationResult: GenerateResult | null;
  generationErrorMsg: string;
  generationProgress: number;
  generationStatusMessage: string;

  // Active Studio State
  activeTab: string;
  aspectRatio: AspectRatio;
  activeTemplateId: string;
  urls: string;
  batchName: string;
  
  // Flattened active settings (merges cover, visual, branding, background states)
  settings: ActiveSettings;
  
  selectedSavedUrlIds: string[];

  // Batch Queue
  batchQueue: BatchQueueItem[];

  // Actions
  setActiveTab: (tab: string) => void;
  setUrls: (urls: string) => void;
  reorderUrls: (newUrlList: string[]) => void;
  appendUrls: (newUrlsToAppend: string[]) => void;
  setBatchName: (name: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setSelectedSavedUrlIds: (ids: string[]) => void;
  
  updateSetting: <K extends keyof ActiveSettings>(key: K, value: ActiveSettings[K]) => void;
  applyTemplate: (t: DesignTemplate) => void;

  // Data Fetching & Syncing
  fetchData: () => Promise<void>;
  addTemplate: (template: DesignTemplate) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<DesignTemplate>) => Promise<void>;
  addSavedUrls: (newItems: SavedUrlItem[]) => Promise<void>;
  removeSavedUrls: (ids: string[]) => Promise<void>;
  updateSavedUrl: (id: string, updates: Partial<SavedUrlItem>) => Promise<void>;

  // Background Generation Engine
  handleGenerate: (urlList: string[]) => Promise<void>;
  resetGeneration: () => void;

  // Batch Queue Actions
  isBatchQueueRunning: boolean;
  isBatchQueueCancelled: boolean;
  enqueueBatch: (urls: string[], batchName: string) => void;
  runBatchQueue: () => Promise<void>;
  cancelBatchQueue: () => void;
  clearBatchQueue: () => void;
  removeBatchQueueItem: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Global Fetched Lists
      templates: [],
      savedUrls: [],
      backgroundList: [],
      fontList: [],
      usedUrls: [],

      // Global Generation Engine State
      generationStatus: "idle",
      generationResult: null,
      generationErrorMsg: "",
      generationProgress: 0,
      generationStatusMessage: "",

      // Active Studio State
      activeTab: "studio",
      aspectRatio: "4:5" as AspectRatio,
      activeTemplateId: "",
      urls: "",
      batchName: "",
      selectedSavedUrlIds: [],
      batchQueue: [] as BatchQueueItem[],
      isBatchQueueRunning: false,
      isBatchQueueCancelled: false,

      settings: {
        coverTitle: "",
        coverSubtitle: "",
        coverStyle: "modern",
        fontFamily: "Inter",
        topLeftText: "@KOCHIKUKO",
        topRightText: "RESOURCES",
        bottomLeftText: "MADE WITH @INSTAS",
        bottomRightText: "SAVE FOR LATER",
        bottomRightIcon: "bookmark",
        blurAmount: 12,
        borderRadius: 12,
        noiseOpacity: 0.04,
        dropShadow: true,
        showBlurredBg: false,
        bgType: "default",
        customBgImage: "",
        screenshotTop: 240,
        screenshotHeight: 520,
        titleTop: 790,
        subtitleTop: 854,
        urlPillTop: 940,
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setUrls: (urls) => set({ urls }),
      reorderUrls: (newUrlList) => set({ urls: newUrlList.join("\n") }),
      appendUrls: (newUrlsToAppend) => {
        const existing = get().urls.split("\n").map((u) => u.trim()).filter(Boolean);
        const setSeen = new Set(existing.map((u) => u.toLowerCase()));
        const added: string[] = [];
        newUrlsToAppend.forEach((u) => {
          const clean = u.trim();
          if (clean && !setSeen.has(clean.toLowerCase())) {
            setSeen.add(clean.toLowerCase());
            added.push(clean);
          }
        });
        set({ urls: [...existing, ...added].join("\n") });
      },
      setBatchName: (name) => set({ batchName: name }),
      setAspectRatio: (ratio) => {
        // Auto-apply layout presets when switching aspect ratios
        const preset = ASPECT_RATIO_LAYOUT_PRESETS[ratio];
        set((state) => ({
          aspectRatio: ratio,
          settings: { ...state.settings, ...preset },
        }));
      },
      setSelectedSavedUrlIds: (ids) => set({ selectedSavedUrlIds: ids }),

      updateSetting: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
      })),

      applyTemplate: (t) => {
        const { id, name, description, isDefault, ...templateSettings } = t;
        set({
          activeTemplateId: id,
          settings: {
            ...templateSettings,
          }
        });
      },

      resetGeneration: () => set({
        generationStatus: "idle",
        generationResult: null,
        generationErrorMsg: "",
        generationProgress: 0,
        generationStatusMessage: "",
      }),

      handleGenerate: async (urlList: string[]) => {
        if (urlList.length === 0) return;
        
        set({
          generationStatus: "loading",
          generationProgress: 0,
          generationResult: null,
          generationErrorMsg: "",
          generationStatusMessage: "Initializing Puppeteer engine...",
        });

        const totalSlides = urlList.length + 1;
        let fakeProgress = 0;
        
        const tick = setInterval(() => {
          fakeProgress = Math.min(fakeProgress + 100 / (totalSlides * 8), 92);
          
          let statusMsg = "Initializing Puppeteer engine...";
          if (fakeProgress < 25) {
            statusMsg = "Initializing Puppeteer engine...";
          } else if (fakeProgress < 65) {
            const currentSlide = Math.min(Math.ceil((fakeProgress / 100) * totalSlides), totalSlides);
            statusMsg = `Capturing slide ${currentSlide} of ${totalSlides}...`;
          } else if (fakeProgress < 88) {
            statusMsg = "Applying overlays & styling...";
          } else {
            statusMsg = "Exporting PNG slide batch...";
          }

          set({
            generationProgress: fakeProgress,
            generationStatusMessage: statusMsg,
          });
        }, 1200);

        try {
          const chunkSize = 5;
          const chunks = [];
          for (let i = 0; i < urlList.length; i += chunkSize) {
            chunks.push(urlList.slice(i, i + chunkSize));
          }

          let currentOutputDir = "";
          let finalData = null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let allSlides: any[] = [];

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const startIndex = i * chunkSize;

            const res = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                urls: chunk,
                batchName: get().batchName,
                aspectRatio: get().aspectRatio,
                ...get().settings,
                chunkIndex: i,
                totalChunks: chunks.length,
                providedOutputDir: currentOutputDir,
                startIndex,
                fullUrlList: urlList,
              }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation failed");

            if (i === 0) {
              currentOutputDir = data.outputDir;
            }

            allSlides = allSlides.concat(data.slides || []);
            finalData = data;
          }

          clearInterval(tick);

          if (finalData) {
            finalData.slides = allSlides; // Combine all slide results for the UI
          }

          set({
            generationProgress: 100,
            generationStatusMessage: "Carousel Batch Generated",
            generationResult: finalData,
            generationStatus: "success",
          });

          await get().fetchData();

          setTimeout(() => {
            if (get().generationStatus === "success") {
              set({ generationStatus: "idle" });
            }
          }, 4000);
        } catch (err: unknown) {
          clearInterval(tick);
          set({
            generationErrorMsg: err instanceof Error ? err.message : "Unknown error",
            generationStatus: "error",
          });
        }
      },

      // Data Fetching & Syncing
      fetchData: async () => {
        try {
          const [tRes, uRes, bRes, fRes, oRes] = await Promise.all([
            fetch("/api/templates").catch(() => null),
            fetch("/api/urls").catch(() => null),
            fetch("/api/backgrounds").catch(() => null),
            fetch("/api/fonts").catch(() => null),
            fetch("/api/outputs").catch(() => null),
          ]);
          
          const updates: Partial<AppState> = {};

          if (tRes?.ok) {
            const tData = await tRes.json();
            if (tData.templates) updates.templates = tData.templates;
          }
          if (uRes?.ok) {
            const uData = await uRes.json();
            if (uData.urls) updates.savedUrls = uData.urls;
          }
          if (bRes?.ok) {
            const bData = await bRes.json();
            if (bData.backgrounds) updates.backgroundList = bData.backgrounds;
          }
          if (fRes?.ok) {
            const fData = await fRes.json();
            if (fData.fonts) {
              updates.fontList = fData.fonts;
              // Inject @font-face rules and auto-correct any stale cached family name
              const currentFamily = get().settings.fontFamily;
              const correctedFamily = injectFontFaceRules(fData.fonts, currentFamily);
              if (correctedFamily !== null) {
                // The stored family name was stale — update it silently
                updates.settings = {
                  ...(updates.settings ?? get().settings),
                  fontFamily: correctedFamily,
                };
              }
            }
          }
          if (oRes?.ok) {
            const oData = await oRes.json();
            if (oData.usedUrls) {
              updates.usedUrls = oData.usedUrls;
            }
          }

          set(updates);
        } catch {
          // quiet fallback
        }
      },

      addTemplate: async (template) => {
        const updated = [...get().templates, template];
        set({ templates: updated });
        await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templates: updated }),
        });
      },

      updateTemplate: async (id, updates) => {
        const updated = get().templates.map(t => (t.id === id ? { ...t, ...updates } : t));
        set({ templates: updated });
        await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templates: updated }),
        });
      },

      addSavedUrls: async (newItems) => {
        const updated = [...get().savedUrls, ...newItems];
        set({ savedUrls: updated });
        await fetch("/api/urls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: updated }),
        });
      },

      removeSavedUrls: async (ids) => {
        const updated = get().savedUrls.filter((item) => !ids.includes(item.id));
        const newSelected = get().selectedSavedUrlIds.filter((id) => !ids.includes(id));
        set({ savedUrls: updated, selectedSavedUrlIds: newSelected });
        await fetch("/api/urls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: updated }),
        });
      },

      updateSavedUrl: async (id, updates) => {
        const updated = get().savedUrls.map((item) => (item.id === id ? { ...item, ...updates } : item));
        set({ savedUrls: updated });
        await fetch("/api/urls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: updated }),
        });
      },

      // Batch Queue Actions
      enqueueBatch: (urls, batchName) => {
        const item: BatchQueueItem = {
          id: crypto.randomUUID(),
          urls,
          batchName: batchName || `Batch ${new Date().toLocaleTimeString()}`,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ batchQueue: [...state.batchQueue, item] }));
      },

      runBatchQueue: async () => {
        const queue = get().batchQueue;
        const pending = queue.filter((i) => i.status === "pending");
        if (pending.length === 0) return;

        set({ isBatchQueueRunning: true, isBatchQueueCancelled: false });

        for (const item of pending) {
          if (get().isBatchQueueCancelled) {
            break;
          }

          set((state) => ({
            batchQueue: state.batchQueue.map((i) =>
              i.id === item.id ? { ...i, status: "running" } : i
            ) as BatchQueueItem[],
          }));

          try {
            const chunkSize = 5;
            const chunks = [];
            for (let i = 0; i < item.urls.length; i += chunkSize) {
              chunks.push(item.urls.slice(i, i + chunkSize));
            }

            let currentOutputDir = "";
            let finalData = null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let allSlides: any[] = [];

            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              const startIndex = i * chunkSize;

              const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  urls: chunk,
                  batchName: item.batchName,
                  aspectRatio: get().aspectRatio,
                  ...get().settings,
                  chunkIndex: i,
                  totalChunks: chunks.length,
                  providedOutputDir: currentOutputDir,
                  startIndex,
                  fullUrlList: item.urls,
                }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Generation failed");

              if (i === 0) {
                currentOutputDir = data.outputDir;
              }

              allSlides = allSlides.concat(data.slides || []);
              finalData = data;
            }

            if (finalData) {
              finalData.slides = allSlides;
            }

            set((state) => ({
              batchQueue: state.batchQueue.map((i) =>
                i.id === item.id ? { ...i, status: "done", result: finalData } : i
              ) as BatchQueueItem[],
            }));

            await get().fetchData();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            set((state) => ({
              batchQueue: state.batchQueue.map((i) =>
                i.id === item.id ? { ...i, status: "error", errorMsg: msg } : i
              ) as BatchQueueItem[],
            }));
          }
        }

        set({ isBatchQueueRunning: false, isBatchQueueCancelled: false });
      },

      cancelBatchQueue: () => set({ isBatchQueueCancelled: true }),

      clearBatchQueue: () => set({ batchQueue: [] }),

      removeBatchQueueItem: (id) =>
        set((state) => ({ batchQueue: state.batchQueue.filter((i) => i.id !== id) })),

    }),
    {
      name: "instascrape-studio-active-state",
      storage: createJSONStorage(() => localStorage),
      // Only persist active studio configuration state across browser reloads
      partialize: (state) => ({
        settings: state.settings,
        aspectRatio: state.aspectRatio,
        activeTemplateId: state.activeTemplateId,
        urls: state.urls,
        batchName: state.batchName,
        selectedSavedUrlIds: state.selectedSavedUrlIds,
      }),
    }
  )
);
