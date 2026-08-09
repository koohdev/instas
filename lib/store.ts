import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DesignTemplate } from "@/lib/templateStore";
import type { SavedUrlItem } from "@/lib/urlLibraryStore";
import type { BackgroundItem } from "@/app/api/backgrounds/route";

import type { FontItem } from "@/app/api/fonts/route";

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
  aspectRatio: "4:5" | "1:1" | "9:16";
  urls: string;
  batchName: string;
  
  // Flattened active settings (merges cover, visual, branding, background states)
  settings: ActiveSettings;
  
  selectedSavedUrlIds: string[];

  // Actions
  setActiveTab: (tab: string) => void;
  setUrls: (urls: string) => void;
  setBatchName: (name: string) => void;
  setAspectRatio: (ratio: "4:5" | "1:1" | "9:16") => void;
  setSelectedSavedUrlIds: (ids: string[]) => void;
  
  updateSetting: <K extends keyof ActiveSettings>(key: K, value: ActiveSettings[K]) => void;
  applyTemplate: (t: DesignTemplate) => void;

  // Data Fetching & Syncing
  fetchData: () => Promise<void>;
  addTemplate: (template: DesignTemplate) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<DesignTemplate>) => Promise<void>;
  addSavedUrls: (newItems: SavedUrlItem[]) => Promise<void>;
  removeSavedUrls: (ids: string[]) => Promise<void>;

  // Background Generation Engine
  handleGenerate: (urlList: string[]) => Promise<void>;
  resetGeneration: () => void;
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
      aspectRatio: "4:5",
      urls: "",
      batchName: "",
      selectedSavedUrlIds: [],
      
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

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setUrls: (urls) => set({ urls }),
      setBatchName: (name) => set({ batchName: name }),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setSelectedSavedUrlIds: (ids) => set({ selectedSavedUrlIds: ids }),

      updateSetting: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
      })),

      applyTemplate: (t) => {
        // Extract everything except id, name, description, isDefault
        const { id, name, description, isDefault, ...templateSettings } = t;
        set({
          settings: {
            ...templateSettings,
            activeTemplateId: id,
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
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              urls: urlList,
              batchName: get().batchName,
              ...get().settings,
            }),
          });

          clearInterval(tick);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Generation failed");

          set({
            generationProgress: 100,
            generationStatusMessage: "Carousel Batch Generated",
            generationResult: data,
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

    }),
    {
      name: "instascrape-studio-active-state",
      storage: createJSONStorage(() => localStorage),
      // Only persist active studio configuration state across browser reloads
      partialize: (state) => ({
        settings: state.settings,
        aspectRatio: state.aspectRatio,
        urls: state.urls,
        batchName: state.batchName,
        selectedSavedUrlIds: state.selectedSavedUrlIds,
      }),
    }
  )
);
