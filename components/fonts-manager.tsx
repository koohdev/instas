"use client";

import { useState, useRef } from "react";
import {
  Type,
  Upload,
  Search,
  Check,
  Play,
  Copy,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useAppStore } from "@/lib/store";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface FontsManagerProps {
  onSelectFont?: (family: string) => void;
}

export function FontsManager({ onSelectFont }: FontsManagerProps) {
  const store = useAppStore();
  const { playClick } = useSoundEffects();

  const [search, setSearch] = useState("");
  const [specimenText, setSpecimenText] = useState("Stop making your own components");
  const [specimenSize, setSpecimenSize] = useState<number>(24);
  const [filterCategory, setFilterCategory] = useState<"all" | "active" | "system" | "custom">("all");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedFont, setCopiedFont] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Group stored fonts by family
  const familyMap: Record<
    string,
    { family: string; formats: string[]; totalSize: number; filesCount: number; isSystem: boolean }
  > = {};

  const defaultFamilies = ["Inter", "Roboto", "Outfit", "Plus Jakarta Sans", "Cabinet Grotesk"];
  for (const name of defaultFamilies) {
    familyMap[name] = { family: name, formats: ["SYSTEM"], totalSize: 0, filesCount: 1, isSystem: true };
  }

  for (const font of store.fontList) {
    if (!familyMap[font.family]) {
      familyMap[font.family] = {
        family: font.family,
        formats: [font.format.toUpperCase()],
        totalSize: font.sizeBytes,
        filesCount: 1,
        isSystem: false,
      };
    } else {
      familyMap[font.family].totalSize += font.sizeBytes;
      familyMap[font.family].filesCount += 1;
      const fmtUpper = font.format.toUpperCase();
      if (!familyMap[font.family].formats.includes(fmtUpper)) {
        familyMap[font.family].formats.push(fmtUpper);
      }
    }
  }

  const activeFontFamily = store.settings.fontFamily;

  const families = Object.values(familyMap).filter((item) => {
    const isSelected = activeFontFamily === item.family;
    if (filterCategory === "active" && !isSelected) return false;
    if (filterCategory === "system" && !item.isSystem) return false;
    if (filterCategory === "custom" && item.isSystem) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return item.family.toLowerCase().includes(q);
    }
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    playClick();
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);
        await fetch("/api/fonts", {
          method: "POST",
          body: data,
        });
      }
      await store.fetchData();
    } catch {
      // quiet handle
    } finally {
      setIsUploading(false);
    }
  };

  const handleApply = (family: string) => {
    playClick();
    store.updateSetting("fontFamily", family);
    if (onSelectFont) {
      onSelectFont(family);
    }
    store.setActiveTab("studio");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "System Built-in";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const SPECIMEN_PRESETS = [
    "Stop making your own components",
    "DESIGN SYSTEM & UI KITS",
    "10 Best UI Frameworks for Next.js",
    "Aa Bb Cc Dd Ee Ff 1234567890",
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200 pb-12">
      {/* Top Hero Banner */}
      <Frame variant="default" spacing="default" className="w-full">
        <FramePanel className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                <Type className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                    Custom Fonts &amp; Typography Lab
                  </h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-2 py-0.5">
                    {Object.keys(familyMap).length} Famili{Object.keys(familyMap).length === 1 ? "y" : "es"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  Manage custom typography stored in <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded border border-primary/20">fonts/</code> folder with live <code className="text-primary font-mono">@font-face</code> slide rendering.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".ttf,.otf,.woff,.woff2,.eot"
                className="hidden"
                onChange={handleFileUpload}
              />

              <Button
                onClick={() => {
                  playClick();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-bold h-9 px-4 cursor-pointer active:scale-[0.97] shadow-sm w-full sm:w-auto justify-center shrink-0"
              >
                <Upload className="w-4 h-4" /> {isUploading ? "Uploading Fonts..." : "Upload Font Files"}
              </Button>
            </div>
          </div>
        </FramePanel>
      </Frame>

      {/* Control Bar: Search, Category Filters, Specimen Text, & Size Slider (Design System Spec) */}
      <Frame variant="default" spacing="default" className="w-full">
        <FramePanel className="p-3 gap-3 flex flex-col">
          {/* Top Control Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-[#A1A1AA]" />
                <Input
                  placeholder="Search fonts by family..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs h-9 bg-background dark:bg-[#09090B] border-input dark:border-[#27272A] rounded-xl text-foreground dark:text-white w-full"
                />
              </div>

              {/* Category Filter Pills (with rounded-[6px] active pill) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:flex items-center min-h-[36px] md:h-9 p-0.5 bg-muted/60 dark:bg-[#09090B] border border-border dark:border-[#27272A] rounded-xl gap-0.5 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    playClick();
                    setFilterCategory("all");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3.5 rounded-[6px] transition-all flex items-center justify-center cursor-pointer w-full md:w-auto ${
                    filterCategory === "all"
                      ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
                      : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  All ({Object.keys(familyMap).length})
                </button>

                <button
                  onClick={() => {
                    playClick();
                    setFilterCategory("active");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3.5 rounded-[6px] transition-all flex items-center justify-center gap-1 cursor-pointer w-full md:w-auto ${
                    filterCategory === "active"
                      ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
                      : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> Active
                </button>

                <button
                  onClick={() => {
                    playClick();
                    setFilterCategory("system");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3.5 rounded-[6px] transition-all flex items-center justify-center cursor-pointer w-full md:w-auto ${
                    filterCategory === "system"
                      ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
                      : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  System
                </button>

                <button
                  onClick={() => {
                    playClick();
                    setFilterCategory("custom");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3.5 rounded-[6px] transition-all flex items-center justify-center cursor-pointer w-full md:w-auto ${
                    filterCategory === "custom"
                      ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
                      : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Active Font Pill */}
            <div className="h-9 ml-auto hidden lg:flex items-center px-3.5 rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-xs text-muted-foreground dark:text-[#A1A1AA] shrink-0 gap-2 font-mono">
              <span className="text-[11px]">Active Studio Font:</span>
              <span className="font-bold text-foreground dark:text-white uppercase tracking-wider" style={{ fontFamily: `'${activeFontFamily}', sans-serif` }}>
                {activeFontFamily}
              </span>
            </div>
          </div>

          {/* Bottom Control Row: Specimen Text & Font Size Slider */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-border dark:border-[#FFFFFF0D] w-full">
            {/* Specimen Input & Shortcuts */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:flex-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-muted-foreground dark:text-[#A1A1AA] shrink-0">Specimen:</span>
                <Input
                  placeholder="Type specimen text..."
                  value={specimenText}
                  onChange={(e) => setSpecimenText(e.target.value)}
                  className="text-xs h-9 bg-background dark:bg-[#09090B] border-input dark:border-[#27272A] text-foreground dark:text-white flex-1 sm:w-64"
                />
              </div>

              {/* Quick Presets Dropdown/Pills */}
              <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                {SPECIMEN_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playClick();
                      setSpecimenText(preset);
                    }}
                    className="h-9 text-xs font-semibold text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] hover:bg-muted dark:hover:bg-[#18181B] px-3.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
                    title={preset}
                  >
                    Preset #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="h-9 flex items-center justify-between gap-2.5 bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] px-3.5 rounded-xl w-full md:w-auto shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <Sliders className="w-3.5 h-3.5 text-muted-foreground dark:text-[#A1A1AA]" />
                <span className="text-xs font-semibold text-muted-foreground dark:text-[#A1A1AA]">Size:</span>
              </div>
              <div className="flex-1 md:w-32 max-w-full">
                <Slider
                  value={[specimenSize]}
                  min={16}
                  max={44}
                  step={1}
                  onValueChange={(val) => {
                    const num = Array.isArray(val) ? val[0] : (val as unknown as number);
                    if (typeof num === "number") setSpecimenSize(num);
                  }}
                  className="cursor-pointer"
                />
              </div>
              <span className="text-xs font-mono font-bold text-foreground dark:text-white w-8 text-right shrink-0">{specimenSize}px</span>
            </div>
          </div>
        </FramePanel>
      </Frame>

      {/* Grid of Font Family Cards */}
      {families.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl bg-card/40 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Type className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Font Families Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            No font families match your search query or filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {families.map((item) => {
            const isSelected = activeFontFamily === item.family;
            return (
              <Frame
                key={item.family}
                variant="default"
                spacing="default"
                className={`group transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "ring-2 ring-inset ring-primary border-primary bg-primary/5 shadow-md"
                    : "hover:border-border/90 hover:shadow-md"
                }`}
              >
                <FramePanel className="gap-3.5 flex flex-col justify-between h-full p-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4
                        className="text-base font-bold text-foreground truncate"
                        style={{ fontFamily: `'${item.family}', sans-serif` }}
                      >
                        {item.family}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.formats.map((fmt) => (
                          <Badge
                            key={fmt}
                            variant="outline"
                            className="text-[9px] font-mono border-primary/30 text-primary uppercase px-1.5 py-0.2"
                          >
                            {fmt}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {isSelected && (
                      <Badge className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 gap-1 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                      </Badge>
                    )}
                  </div>

                  {/* Live Interactive Specimen Display Card */}
                  <div className="p-4 rounded-xl border border-border/60 bg-card flex flex-col gap-2 min-h-[120px] justify-center shadow-xs">
                    <span
                      className="font-bold text-foreground leading-tight tracking-tight line-clamp-2"
                      style={{
                        fontFamily: `'${item.family}', sans-serif`,
                        fontSize: `${specimenSize}px`,
                      }}
                    >
                      {specimenText || "Stop making your own components"}
                    </span>

                    <span
                      className="text-xs text-muted-foreground line-clamp-1 opacity-80 pt-1 border-t border-border/30 mt-1"
                      style={{ fontFamily: `'${item.family}', sans-serif` }}
                    >
                      Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz • 0123456789
                    </span>
                  </div>

                  {/* Card Footer Actions (Design System Spec) */}
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-[#27272A] w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#A1A1AA] truncate">
                        {item.filesCount} file{item.filesCount !== 1 ? "s" : ""} • {formatFileSize(item.totalSize)}
                      </span>
                      {item.isSystem && (
                        <Badge variant="outline" className="text-[9px] font-mono border-[#3F3F46] text-[#A1A1AA] uppercase px-1.5 py-0.2">
                          Built-in
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center h-[42px] gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => handleApply(item.family)}
                        className={`flex-1 h-full rounded-xl border border-transparent font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-[0.98] ${
                          isSelected
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "bg-foreground text-background hover:bg-foreground/90"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Active Studio Font</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Use in Studio</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          navigator.clipboard.writeText(item.family);
                          setCopiedFont(item.family);
                          setTimeout(() => setCopiedFont(null), 2000);
                        }}
                        className="h-full aspect-square rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-foreground dark:text-white flex items-center justify-center hover:bg-muted dark:hover:bg-[#18181B] hover:border-border dark:hover:border-[#3F3F46] cursor-pointer transition-all active:scale-[0.98] shrink-0"
                        title="Copy Font Family Name"
                      >
                        {copiedFont === item.family ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-foreground dark:text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </FramePanel>
              </Frame>
            );
          })}
        </div>
      )}
    </div>
  );
}
