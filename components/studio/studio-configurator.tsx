"use client";

import { useState } from "react";
import {
  CheckCheck,
  Sparkles,
  Sliders,
  Type,
  LayoutGrid,
  Smartphone,
  Square,
  RectangleHorizontal,
  Monitor,
  FileText,
  Maximize2,
  Network,
  Bookmark,
  Globe,
  Palette,
  Layers,
  Wand2,
  FolderPlus,
} from "lucide-react";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/lib/store";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { sanitizeUrls } from "@/utils/url-sanitizer";
import type { AspectRatio } from "@/lib/types";
import { FontSelectorModal } from "./font-selector-modal";

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

  const [sanitizedNotice, setSanitizedNotice] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);

  const handleSanitize = () => {
    if (!store.urls.trim()) return;
    const sanitized = sanitizeUrls(store.urls);
    store.setUrls(sanitized);
    setSanitizedNotice(true);
    setTimeout(() => setSanitizedNotice(false), 2500);

    // Auto-fill Cover Title from first URL if empty
    if (!store.settings.coverTitle && sanitized.length > 0) {
      const firstUrl = sanitized.split("\n")[0];
      try {
        const urlObj = new URL(firstUrl);
        const hostName = urlObj.hostname.replace(/^www\./, "");
        const title = hostName.charAt(0).toUpperCase() + hostName.slice(1);
        store.updateSetting("coverTitle", title);
        store.updateSetting("coverSubtitle", "Curated web developer resource");
      } catch {
        // quiet fail
      }
    }
  };

  const urlList = store.urls.split("\n").map((u) => u.trim()).filter(Boolean);

  return (
    <Frame variant="default" spacing="default" className="w-full">
      <FramePanel className="gap-6 p-5 sm:p-6">
        {/* Header with Studio Launchpad Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50 gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                  Studio Configurator
                </h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-2 py-0.5">
                  {urlList.length} URL{urlList.length === 1 ? "" : "s"} Staged
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Configure input sources, cover typography, platform ratios, and frame padding.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
            <Button
              variant={studioViewMode === "canvas" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                playClick();
                onStudioViewModeChange?.(studioViewMode === "canvas" ? "form" : "canvas");
              }}
              className={`gap-1.5 text-xs font-semibold h-8 px-3 cursor-pointer active:scale-[0.97] transition-all w-full md:w-auto justify-center ${
                studioViewMode === "canvas"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={studioViewMode === "canvas" ? "Return to Form View" : "Switch to Node Canvas View"}
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
              className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 font-semibold h-8 px-3 cursor-pointer active:scale-[0.97] transition-all w-full md:w-auto justify-center"
              title="Open Staging Drawer"
            >
              <Bookmark className="w-3.5 h-3.5" /> <span>Staging Drawer</span>
            </Button>
          </div>
        </div>

        {/* UNIFIED CONTINUOUS STEP FLOW */}
        <div className="flex flex-col gap-6">
          {/* STEP 1: TARGET WEBPAGE URLS & BATCH NAME */}
          <div className="flex flex-col gap-3.5 bg-card/50 p-4 rounded-xl border border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono flex items-center justify-center border border-primary/20">
                  1
                </span>
                <Label className="text-xs font-bold text-foreground">
                  Target Webpage URLs
                </Label>
              </div>

              {sanitizedNotice ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <CheckCheck className="w-3 h-3 mr-1" /> Cleaned!
                </Badge>
              ) : (
                <span className="text-[11px] font-mono text-muted-foreground">
                  {urlList.length} line{urlList.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <Textarea
              rows={4}
              placeholder={"https://reactbits.dev\nhttps://framer.com"}
              value={store.urls}
              onChange={(e) => store.setUrls(e.target.value)}
              onBlur={handleSanitize}
              className="font-mono text-xs bg-muted/20 border-border rounded-xl focus:ring-1 focus:ring-primary"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Label className="text-[11px] uppercase font-bold text-muted-foreground block mb-1.5 tracking-wider">
                  Output Folder Name (Optional)
                </Label>
                <Input
                  placeholder="e.g. Design-Tools-Worth-Bookmarking"
                  value={store.batchName}
                  onChange={(e) => store.setBatchName(e.target.value)}
                  className="text-xs h-8 bg-background/80"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playClick();
                    handleSanitize();
                  }}
                  className="h-8 text-xs font-semibold gap-1.5 w-full border-border hover:bg-muted cursor-pointer active:scale-[0.97]"
                >
                  <Wand2 className="w-3.5 h-3.5 text-primary" /> Clean Parameters
                </Button>
              </div>
            </div>
          </div>

          {/* STEP 2: COVER LAYOUT & TYPOGRAPHY */}
          <div className="flex flex-col gap-3.5 bg-card/50 p-4 rounded-xl border border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono flex items-center justify-center border border-primary/20">
                  2
                </span>
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-primary" /> Cover Layout &amp; Typography
                </Label>
              </div>

              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                Font: {store.settings.fontFamily || "Inter"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="grid gap-1.5">
                <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                  Cover Design Style
                </Label>
                <Select
                  value={store.settings.coverStyle}
                  onValueChange={(val) => {
                    playClick();
                    store.updateSetting("coverStyle", val as "minimal" | "bold" | "modern");
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-background/80 capitalize">
                    <SelectValue placeholder="Select cover style..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                  Typography &amp; Font Family
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playClick();
                    setIsFontModalOpen(true);
                  }}
                  className="w-full h-8 text-xs justify-between font-semibold bg-background/80 hover:bg-muted border-border cursor-pointer active:scale-[0.97]"
                >
                  <span className="truncate font-bold" style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}>
                    {store.settings.fontFamily || "Inter"}
                  </span>
                  <Type className="w-3.5 h-3.5 text-primary shrink-0" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label className="text-[11px] uppercase font-bold text-muted-foreground block mb-1.5 tracking-wider">
                  Cover Title
                </Label>
                <Input
                  placeholder="Stop making your own components"
                  value={store.settings.coverTitle}
                  onChange={(e) => store.updateSetting("coverTitle", e.target.value)}
                  className="text-xs h-8 bg-background/80"
                />
              </div>

              <div>
                <Label className="text-[11px] uppercase font-bold text-muted-foreground block mb-1.5 tracking-wider">
                  Cover Subtitle
                </Label>
                <Input
                  placeholder="A curated list of UI kits to copy and paste"
                  value={store.settings.coverSubtitle}
                  onChange={(e) => store.updateSetting("coverSubtitle", e.target.value)}
                  className="text-xs h-8 bg-background/80"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: EXPORT FORMAT & DESIGN TEMPLATE */}
          <div className="flex flex-col gap-3.5 bg-card/50 p-4 rounded-xl border border-border/60">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono flex items-center justify-center border border-primary/20">
                3
              </span>
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" /> Platform Format &amp; Design Preset
              </Label>
            </div>

            {/* FORMAT SWITCHER — 5 platform formats */}
            <div className="grid gap-1.5">
              <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Platform Format
              </Label>
              <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-muted/40 rounded-xl border border-border/60">
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
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-inset ring-primary bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9.5px] font-bold leading-none">{label}</span>
                      <span className="text-[8.5px] font-mono opacity-70">{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-1.5 pt-1">
              <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Design Template Preset
              </Label>
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
                    <SelectTrigger className="w-full h-8 text-xs bg-background/80">
                      <SelectValue>
                        {activeTpl ? activeTpl.name : "Select design template preset..."}
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

          {/* STEP 4: CARD FRAMING & PADDING */}
          <div className="flex flex-col gap-3.5 bg-card/50 p-4 rounded-xl border border-border/60">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono flex items-center justify-center border border-primary/20">
                4
              </span>
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-primary" /> Card Framing &amp; Padding Lab
              </Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                    Outer Padding ({store.settings.cardPadding ?? 40}px)
                  </Label>
                </div>
                <Slider
                  value={[store.settings.cardPadding ?? 40]}
                  min={0}
                  max={80}
                  step={2}
                  onValueChange={(val) =>
                    store.updateSetting("cardPadding", Array.isArray(val) ? val[0] : val)
                  }
                  className="cursor-pointer"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                    Inner Card Radius ({store.settings.cardBorderRadius ?? 28}px)
                  </Label>
                </div>
                <Slider
                  value={[store.settings.cardBorderRadius ?? 28]}
                  min={0}
                  max={48}
                  step={2}
                  onValueChange={(val) =>
                    store.updateSetting("cardBorderRadius", Array.isArray(val) ? val[0] : val)
                  }
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="grid gap-1.5 pt-1">
              <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Frame Outer Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={store.settings.cardOuterBg || "#0C1014"}
                  onChange={(e) => store.updateSetting("cardOuterBg", e.target.value)}
                  className="h-8 text-xs font-mono w-28 bg-background/80"
                />
                <div className="flex items-center gap-1.5">
                  {[
                    { label: "Default Dark", hex: "#0C1014" },
                    { label: "Pure Black", hex: "#000000" },
                    { label: "Slate", hex: "#0F172A" },
                    { label: "Zinc", hex: "#18181B" },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => {
                        playClick();
                        store.updateSetting("cardOuterBg", color.hex);
                      }}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                        (store.settings.cardOuterBg || "#0C1014").toLowerCase() === color.hex.toLowerCase()
                          ? "ring-2 ring-primary border-white scale-110"
                          : "border-white/20 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FramePanel>

      <FontSelectorModal
        open={isFontModalOpen}
        onOpenChange={setIsFontModalOpen}
        selectedFontFamily={store.settings.fontFamily || "Inter"}
        onSelect={(family) => store.updateSetting("fontFamily", family)}
      />
    </Frame>
  );
}
