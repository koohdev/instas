"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Sliders,
  Smartphone,
  Square,
  RectangleHorizontal,
  Monitor,
  FileText,
  Network,
  Bookmark,
  Globe,
  CheckCheck,
  Plus,
  Pencil,
  Wand2,
  Upload,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { sanitizeUrls } from "@/utils/url-sanitizer";
import { parseImportedFile } from "@/utils/url-importer";
import type { AspectRatio } from "@/lib/types";

interface StudioConfiguratorProps {
  studioViewMode?: "form" | "canvas";
  onStudioViewModeChange?: (mode: "form" | "canvas") => void;
  onOpenStagingDrawer?: () => void;
  onOpenPresetDialog?: () => void;
}

export function StudioConfigurator({
  studioViewMode = "form",
  onStudioViewModeChange,
  onOpenStagingDrawer,
  onOpenPresetDialog,
}: StudioConfiguratorProps = {}) {
  const store = useAppStore();
  const { playClick } = useSoundEffects();
  const [isEditingUrls, setIsEditingUrls] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const urlList = store.urls.split("\n").map((u) => u.trim()).filter(Boolean);

  const handleSanitize = () => {
    if (!store.urls.trim()) return;
    const sanitized = sanitizeUrls(store.urls);
    store.setUrls(sanitized);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedUrls = await parseImportedFile(file);
      if (importedUrls.length > 0) {
        store.appendUrls(importedUrls);
        playClick();
      }
    } catch (err) {
      console.error("Failed to parse imported file:", err);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const newOrder = [...urlList];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    store.reorderUrls(newOrder);
    setDraggedIndex(null);
    playClick();
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...urlList];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    store.reorderUrls(newOrder);
    playClick();
  };

  const handleMoveDown = (index: number) => {
    if (index >= urlList.length - 1) return;
    const newOrder = [...urlList];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    store.reorderUrls(newOrder);
    playClick();
  };

  return (
    <Frame variant="default" spacing="default" className="w-full flex flex-col lg:h-[720px]">
      <FramePanel className="gap-5 p-5 sm:p-6 bg-card text-card-foreground dark:bg-[#171717] border border-border dark:border-[#27272A] h-full overflow-y-auto custom-scrollbar justify-between flex flex-col">
        {/* Header with Studio Launchpad Actions (Node 3KU-0 Spec) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border dark:border-[#FFFFFF0D] gap-3 w-full">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-[9px] bg-muted dark:bg-[#E5E5E51A] border border-border dark:border-[#E5E5E533] flex items-center justify-center text-foreground dark:text-white shrink-0 shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-heading text-foreground dark:text-[#FAFAFA] leading-tight">
                  Studio Configurator
                </h2>
              </div>
              <p className="text-xs text-muted-foreground dark:text-[#A1A1A1] mt-0.5 hidden sm:block">
                Configure input sources, cover typography, platform ratios, and frame padding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-start sm:justify-end">
            <Button
              variant={studioViewMode === "canvas" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                playClick();
                onStudioViewModeChange?.(studioViewMode === "canvas" ? "form" : "canvas");
              }}
              className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold h-8 px-3 bg-muted/60 dark:bg-[#FFFFFF0B] border-border dark:border-[#FFFFFF26] text-muted-foreground dark:text-[#A1A1A1] hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-[#FFFFFF1A] cursor-pointer active:scale-[0.97] transition-all"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Node Canvas</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                playClick();
                onOpenStagingDrawer?.();
              }}
              className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold h-8 px-3 bg-muted/60 dark:bg-[#FFFFFF0B] border-border dark:border-[#FFFFFF26] text-foreground dark:text-[#E5E5E5] hover:bg-muted dark:hover:bg-[#FFFFFF1A] cursor-pointer active:scale-[0.97] transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Staging Drawer</span>
            </Button>
          </div>
        </div>

        {/* INPUTS ROW: BATCH NAME & INSTAGRAM TARGET HANDLE (Node 3KU-0 Spec) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground dark:text-[#A1A1AA] tracking-[0.5px]">
              BATCH NAME
            </Label>
            <Input
              placeholder="Tech Leaders Spotlight Q3"
              value={store.batchName}
              onChange={(e) => store.setBatchName(e.target.value)}
              className="py-2.5 px-3.5 rounded-lg bg-background dark:bg-[#2828280B] border border-input dark:border-[#27272A] text-foreground dark:text-white font-semibold text-[13px] h-10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground dark:text-[#A1A1AA] tracking-[0.5px]">
              INSTAGRAM TARGET HANDLE
            </Label>
            <Input
              placeholder="@tech.design.daily"
              value={store.settings.topLeftText || "@tech.design.daily"}
              onChange={(e) => store.updateSetting("topLeftText", e.target.value)}
              className="py-2.5 px-3.5 rounded-lg bg-background dark:bg-[#2828280B] border border-input dark:border-[#27272A] text-muted-foreground dark:text-[#A1A1AA] font-medium text-[13px] h-10"
            />
          </div>
        </div>

        {/* STAGED URL SOURCE TABLE (Node 3KU-0 Spec) */}
        <div className="flex flex-col w-full gap-2">
          {/* Section Toolbar Row */}
          <div className="flex items-center justify-between px-1 py-0.5 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-[11px] uppercase font-bold text-muted-foreground dark:text-[#A1A1AA] tracking-[0.5px]">
                STAGED URL SOURCES
              </Label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted dark:bg-[#27272A] text-muted-foreground dark:text-[#A1A1AA]">
                {urlList.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={() => setIsEditingUrls(!isEditingUrls)}
                className="h-7 w-full sm:w-auto justify-center px-2.5 text-[11px] font-semibold text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white bg-muted/60 dark:bg-[#09090B] border border-border dark:border-[#27272A] hover:bg-muted dark:hover:bg-[#18181B] rounded-md transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Pencil className="w-3 h-3" />
                <span>{isEditingUrls ? "Done Editing" : "Edit Raw URLs"}</span>
              </button>
              
              {/* File Import Trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 w-full sm:w-auto justify-center px-2.5 text-[11px] font-semibold text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white bg-muted/60 dark:bg-[#09090B] border border-border dark:border-[#27272A] hover:bg-muted dark:hover:bg-[#18181B] rounded-md transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Import URLs from .csv, .txt or Notion export"
              >
                <Upload className="w-3 h-3" />
                <span>Import File</span>
              </button>
            </div>
          </div>

          {/* Table Header Row */}
          <div className="flex justify-between items-center py-2 px-4 md:px-1 border-b border-border/40 dark:border-[#27272A]/50">
            <div className="w-full sm:w-[320px] shrink-0 tracking-[0.5px] uppercase font-bold text-muted-foreground dark:text-[#71717A] text-xs">
              URL Source ↕
            </div>
            <div className="hidden sm:inline-block w-55 shrink-0 tracking-[0.5px] uppercase font-bold text-muted-foreground dark:text-[#71717A] text-xs">
              Category ↕
            </div>
            <div className="hidden sm:inline-block w-45 shrink-0 tracking-[0.5px] uppercase font-bold text-muted-foreground dark:text-[#71717A] text-xs">
              Status ↕
            </div>
            <div className="hidden sm:inline-block w-35 text-right shrink-0 tracking-[0.5px] uppercase font-bold text-muted-foreground dark:text-[#71717A] text-xs">
              Staged ↕
            </div>
          </div>

          {isEditingUrls ? (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/40 dark:bg-[#2828280B] border border-border dark:border-[#27272A]">
              <Textarea
                rows={5}
                placeholder={"https://reactbits.dev\nhttps://framer.com\nhttps://linear.app"}
                value={store.urls}
                onChange={(e) => store.setUrls(e.target.value)}
                onBlur={handleSanitize}
                className="font-mono text-xs bg-background dark:bg-black/40 border-input dark:border-[#27272A] rounded-lg text-foreground dark:text-white"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground dark:text-[#A1A1AA]">
                <span>Paste or edit one URL per line.</span>
                <span className="font-semibold text-primary">{urlList.length} Staged URLs</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {(urlList.length > 0
                ? urlList
                : ["https://reactbits.dev", "https://framer.com", "https://linear.app"]
              ).map((url, idx) => {
                const match = store.savedUrls.find((u) =>
                  u.url.toLowerCase().includes(url.toLowerCase().replace(/^https?:\/\//, "").split("/")[0])
                );
                const category =
                  match?.category ||
                  (idx === 0
                    ? "Animated Components"
                    : idx === 1
                    ? "Prototyping System"
                    : "Issue Tracking");
                const isScraped = match?.status === "processed" || idx < 2;

                return (
                  <div
                    key={`${url}-${idx}`}
                    draggable
                    onDragStart={(e) => {
                      setDraggedIndex(idx);
                      e.dataTransfer.setData("text/plain", String(idx));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(idx);
                    }}
                    className={`flex justify-between items-center py-2.5 px-3 rounded-xl bg-muted/40 dark:bg-[#2828280B] border border-border dark:border-[#27272A] transition-all ${
                      draggedIndex === idx ? "opacity-40 border-primary" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="w-full sm:w-[320px] flex items-center gap-2 shrink-0 min-w-0">
                      {/* Drag Handle & Reorder Up/Down */}
                      <div className="flex items-center gap-0.5 text-muted-foreground dark:text-[#71717A] shrink-0">
                        <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing hover:text-foreground dark:hover:text-white" />
                        <div className="flex flex-col -space-y-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveUp(idx)}
                            className="hover:text-foreground dark:hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === urlList.length - 1}
                            onClick={() => handleMoveDown(idx)}
                            className="hover:text-foreground dark:hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {(() => {
                        try {
                          const domain = new URL(url).hostname;
                          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                          return (
                            <img
                              src={faviconUrl}
                              alt=""
                              className="w-4 h-4 rounded shrink-0 object-contain ml-1"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                                const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "inline-block";
                              }}
                            />
                          );
                        } catch {
                          return null;
                        }
                      })()}
                      <Globe className="w-4 h-4 text-muted-foreground dark:text-[#A1A1AA] shrink-0 hidden" />
                      <div className="inline-block font-semibold text-foreground dark:text-white text-sm truncate">
                        {url}
                      </div>
                    </div>

                    <div className="hidden sm:inline-block w-55 shrink-0 text-muted-foreground dark:text-[#A1A1AA] text-[13px]">
                      {category}
                    </div>

                    <div className="hidden sm:inline-block w-45 shrink-0">
                      <div
                        className={`inline-flex items-center py-1 px-3 rounded-lg gap-1.5 ${
                          isScraped ? "bg-[#34D3991F]" : "bg-[#FBBF241F]"
                        }`}
                      >
                        <CheckCheck
                          className={`w-3 h-3 ${isScraped ? "text-[#34D399]" : "text-[#FBBF24]"}`}
                        />
                        <div
                          className={`inline-block font-bold text-xs ${
                            isScraped ? "text-[#34D399]" : "text-[#FBBF24]"
                          }`}
                        >
                          {isScraped ? "Scraped" : "Queued"}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:inline-block w-35 text-right shrink-0 text-muted-foreground dark:text-[#71717A] text-[13px]">
                      {idx === 0 ? "2 min ago" : idx === 1 ? "5 min ago" : "Just now"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PLATFORM FORMAT & DESIGN PRESET (Node 3KU-0 Spec) */}
        <div className="flex flex-col w-full rounded-[9px] gap-3.5 px-5 py-4 bg-muted/40 dark:bg-[#17171780] border border-border dark:border-[#FFFFFF0F]">
          <div className="items-center flex gap-2">
            <div className="items-center flex gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-foreground dark:text-[#FAFAFA]" />
              <div className="inline-block text-[12px] font-bold text-foreground dark:text-[#FAFAFA]">
                Platform Format &amp; Design Preset
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-2.5">

            {/* 5 Aspect Ratio Cards */}
            <div className="flex w-full p-1.5 rounded-xl gap-2 sm:gap-2.5 bg-muted/50 dark:bg-[#09090B0B] border border-border dark:border-[#27272A] overflow-x-auto scrollbar-hide shrink-0 min-w-0">
              {(([
                { value: "9:16" as AspectRatio, icon: Smartphone, label: "Story", sub: "9:16" },
                { value: "1:1" as AspectRatio, icon: Square, label: "Square", sub: "1:1" },
                { value: "4:5" as AspectRatio, icon: RectangleHorizontal, label: "Feed", sub: "4:5" },
                { value: "16:9" as AspectRatio, icon: Monitor, label: "X Banner", sub: "16:9" },
                { value: "linkedin-pdf" as AspectRatio, icon: FileText, label: "LinkedIn", sub: "PDF" },
              ] as const)).map(({ value, icon: Icon, label, sub }) => {
                const isSelected = store.aspectRatio === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      playClick();
                      store.setAspectRatio(value);
                    }}
                    className={`flex flex-col items-center justify-center min-w-[64px] sm:min-w-0 grow basis-0 h-16 sm:h-17 rounded-lg gap-1 shrink-0 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-[#FAFAFA] dark:text-[#09090B] border border-primary dark:border-[#FFFFFF] font-extrabold shadow-sm"
                        : "bg-background dark:bg-[#18181B0B] border border-border dark:border-[#27272A] text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isSelected ? "text-white dark:text-[#09090B]" : "text-muted-foreground dark:text-[#A1A1AA]"}`} />
                    <span className={`text-[10.5px] sm:text-[11px] font-bold leading-none ${isSelected ? "text-white dark:text-[#09090B]" : "text-foreground dark:text-[#FAFAFA]"}`}>{label}</span>
                    <span className={`text-[9px] sm:text-[9.5px] font-mono ${isSelected ? "text-zinc-300 dark:text-[#3F3F46] font-bold" : "text-muted-foreground dark:text-[#71717A]"}`}>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid pt-1 gap-1.5">
            <div className="text-[11px] tracking-[0.55px] uppercase leading-none font-bold text-muted-foreground dark:text-[#A1A1A1]">
              DESIGN TEMPLATE PRESET
            </div>
            {(() => {
              const activeTpl = store.templates.find(
                (t) => t.id === store.activeTemplateId || t.customBgImage === store.settings.customBgImage
              );
              return (
                <Select
                  value={store.activeTemplateId || activeTpl?.id || ""}
                  onValueChange={(tplId) => {
                    if (!tplId) return;
                    playClick();
                    const found = store.templates.find((t) => t.id === tplId);
                    if (found) {
                      store.applyTemplate(found);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-background dark:bg-[#FFFFFF0B] border-input dark:border-[#FFFFFF26] text-foreground dark:text-[#FAFAFA]">
                    <SelectValue>
                      {activeTpl ? activeTpl.name : "Standard Dark (Default)"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {store.templates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
          </div>
        </div>

        {/* GENERATE CAROUSEL ACTION BAR (Node 3KU-0 Spec) */}
        <div className="flex flex-col gap-4 pt-1">
          <div className="p-2 rounded-[9px] backdrop-blur-md shadow-2xl bg-card/90 dark:bg-[#0A0A0ACC] border border-border dark:border-[#E5E5E54D]">
            <Button
              type="button"
              onClick={() => {
                if (store.generationStatus !== "loading") {
                  playClick();
                  store.handleGenerate(urlList.length > 0 ? urlList : ["https://reactbits.dev", "https://framer.com", "https://linear.app"]);
                }
              }}
              disabled={store.generationStatus === "loading"}
              className={`relative overflow-hidden w-full h-12 rounded-[10px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md border-0 ${
                store.generationStatus === "loading"
                  ? "bg-muted text-muted-foreground dark:bg-[#1f1f1f] dark:text-white cursor-not-allowed"
                  : store.generationStatus === "success"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-[#E5E5E5] dark:hover:bg-white dark:text-[#171717] active:scale-[0.98]"
              }`}
            >
              {/* Progress fill bar inside the main button */}
              {store.generationStatus === "loading" && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary/30 border-r-2 border-primary"
                  initial={{ width: "4%" }}
                  animate={{ width: `${Math.max(Math.round(store.generationProgress), 4)}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-pulse" />
                </motion.div>
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {store.generationStatus === "loading" ? (
                  <>
                    <Wand2 className="w-4 h-4 text-primary  shrink-0" />
                    <span className="text-foreground dark:text-white">
                      {store.generationStatusMessage || `Generating (${urlList.length > 0 ? urlList.length + 1 : 4} slides)...`}
                    </span>
                    <span className="font-mono text-xs font-bold text-primary">
                      ({Math.round(store.generationProgress)}%)
                    </span>
                  </>
                ) : store.generationStatus === "success" ? (
                  <>
                    <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Carousel Batch Generated!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white dark:text-[#171717] fill-current" />
                    <span>Generate Carousel ({urlList.length > 0 ? urlList.length + 1 : 4} slides)</span>
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </FramePanel>
    </Frame>
  );
}
