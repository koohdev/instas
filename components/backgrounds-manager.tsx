"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  Check,
  Image as ImageIcon,
  Play,
  Search,
  CheckCircle2,
  Copy,
  Eye,
  Sparkles,
  Maximize2,
  Grid,
  Ratio,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Frame, FramePanel } from "@/components/ui/frame";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface BackgroundsManagerProps {
  activeBackground?: string;
  onSelectBackground?: (filename: string) => void;
}

export function BackgroundsManager({ activeBackground, onSelectBackground }: BackgroundsManagerProps) {
  const store = useAppStore();
  const { playClick } = useSoundEffects();

  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [lightboxBg, setLightboxBg] = useState<{ name: string; filename: string; url: string; sizeBytes: number } | null>(null);

  // Aspect Ratio Preview Toggle: 4:5 Carousel Portrait vs 1:1 Square vs 16:9 Landscape
  const [aspectRatio, setAspectRatio] = useState<"4/5" | "1/1" | "16/9">("4/5");
  // Status Filter: "all" vs "active"
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("all");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = store.fetchData;
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    playClick();
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/backgrounds", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        await store.fetchData();
      }
    } catch {
      // quiet fail
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    playClick();
    try {
      const res = await fetch(`/api/backgrounds?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await store.fetchData();
      }
    } catch {
      // quiet fail
    }
  };

  const currentActiveBg = activeBackground || store.settings.customBgImage;

  const filteredBackgrounds = store.backgroundList.filter((bg) => {
    const isSelected = currentActiveBg === bg.filename;
    if (statusFilter === "active" && !isSelected) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return bg.name.toLowerCase().includes(q) || bg.filename.toLowerCase().includes(q);
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSizeBytes = store.backgroundList.reduce((acc, bg) => acc + bg.sizeBytes, 0);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200 pb-12">
      {/* Top Hero Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-card via-card/90 to-primary/5 border border-border/80 shadow-md">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground leading-tight">
                Background Assets Library
              </h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold">
                {store.backgroundList.length} Asset{store.backgroundList.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Upload, inspect, and manage custom background image assets for Instagram carousel slides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          <Button
            onClick={() => {
              playClick();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-bold h-9 px-4 cursor-pointer active:scale-[0.97] shadow-sm shrink-0"
          >
            <Upload className="w-4 h-4" /> {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </div>

      {/* Control Bar: Search, Filters, & Aspect Ratio Switcher - Standardized to h-8 height */}
      <div className="flex items-center gap-2 bg-card p-2.5 rounded-xl border border-border/70 shadow-xs">
        {/* Search */}
        <div className="relative shrink-0 w-44 sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search backgrounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8 bg-background/80 w-full"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border/50 shrink-0 hidden sm:block" />

        {/* Status Filter Pills - h-8 height */}
        <div className="flex items-center h-8 gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
          <button
            onClick={() => {
              playClick();
              setStatusFilter("all");
            }}
            className={`h-full flex-none text-xs font-semibold px-3 rounded-md transition-all flex items-center justify-center cursor-pointer ${
              statusFilter === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({store.backgroundList.length})
          </button>
          <button
            onClick={() => {
              playClick();
              setStatusFilter("active");
            }}
            className={`h-full flex-none text-xs font-semibold px-3 rounded-md transition-all inline-flex items-center gap-1 cursor-pointer ${
              statusFilter === "active"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Active in Studio
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Aspect Ratio Switcher Toggle - h-8 height */}
        <div className="flex items-center h-8 gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground px-2 hidden md:inline">Ratio:</span>
          <button
            onClick={() => {
              playClick();
              setAspectRatio("4/5");
            }}
            className={`h-full flex-none text-[11px] font-mono font-bold px-2 rounded transition-all flex items-center justify-center cursor-pointer ${
              aspectRatio === "4/5" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="4:5 Portrait Carousel Ratio"
          >
            4:5
          </button>
          <button
            onClick={() => {
              playClick();
              setAspectRatio("1/1");
            }}
            className={`h-full flex-none text-[11px] font-mono font-bold px-2 rounded transition-all flex items-center justify-center cursor-pointer ${
              aspectRatio === "1/1" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="1:1 Square Ratio"
          >
            1:1
          </button>
          <button
            onClick={() => {
              playClick();
              setAspectRatio("16/9");
            }}
            className={`h-full flex-none text-[11px] font-mono font-bold px-2 rounded transition-all flex items-center justify-center cursor-pointer ${
              aspectRatio === "16/9" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="16:9 Landscape Ratio"
          >
            16:9
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => {
          playClick();
          fileInputRef.current?.click();
        }}
        className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]"
            : "border-border/60 bg-card/60 hover:border-primary/60 hover:bg-muted/20 shadow-xs"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-foreground">
            Drag &amp; drop background images here or click to browse
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Supports PNG, JPG, WEBP, GIF up to 10MB • Total Storage Used:{" "}
            <span className="font-mono font-semibold text-foreground">{formatFileSize(totalSizeBytes)}</span>
          </p>
        </div>
      </div>

      {/* Visual Background Picture Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-primary" /> Stored Background Assets ({filteredBackgrounds.length})
          </h4>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
            Preview Ratio: {aspectRatio}
          </Badge>
        </div>

        {filteredBackgrounds.length === 0 ? (
          <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center bg-card/40">
            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
            <h5 className="text-sm font-bold text-foreground">No Background Assets Found</h5>
            <p className="text-xs text-muted-foreground">
              Upload background image files above to use them in your carousel designs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBackgrounds.map((bg) => {
              const isSelected = currentActiveBg === bg.filename;
              return (
                <Frame
                  key={bg.id}
                  variant="default"
                  spacing="default"
                  className={`group transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "ring-2 ring-inset ring-primary border-primary bg-primary/5 shadow-md"
                      : "hover:border-border/90 hover:shadow-md"
                  }`}
                >
                  <FramePanel className="p-0 gap-0 overflow-hidden rounded-t-xl flex flex-col justify-between h-full">
                    {/* Visual Image Picture Preview */}
                    <div
                      onClick={() => {
                        playClick();
                        setLightboxBg(bg);
                      }}
                      className={`relative w-full bg-neutral-950 overflow-hidden rounded-t-xl cursor-pointer ${
                        aspectRatio === "4/5"
                          ? "aspect-[4/5]"
                          : aspectRatio === "1/1"
                          ? "aspect-square"
                          : "aspect-video"
                      }`}
                    >
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />

                      {/* Active Pill Badge */}
                      {isSelected && (
                        <Badge className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground text-[9.5px] font-bold gap-1 shadow-md z-10">
                          <Check className="w-3 h-3 stroke-[3]" /> ACTIVE IN STUDIO
                        </Badge>
                      )}

                      {/* Size pill badge */}
                      <Badge
                        variant="secondary"
                        className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white border border-white/20 font-mono text-[9.5px] px-1.5 py-0.2 z-10"
                      >
                        {formatFileSize(bg.sizeBytes)}
                      </Badge>

                      {/* Hover Inspect Lightbox Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <Button variant="secondary" size="xs" className="gap-1 text-[11px] font-bold shadow-lg">
                          <Maximize2 className="w-3 h-3 text-primary" /> Inspect Asset
                        </Button>
                      </div>
                    </div>

                    {/* Meta Footer & Action Buttons */}
                    <div className="p-3.5 flex flex-col gap-3 bg-card flex-1 justify-between">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{bg.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                          {bg.filename}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-1.5">
                        <Button
                          size="xs"
                          variant={isSelected ? "secondary" : "default"}
                          onClick={() => {
                            playClick();
                            if (onSelectBackground) {
                              onSelectBackground(bg.filename);
                            } else {
                              store.updateSetting("bgType", "custom");
                              store.updateSetting("customBgImage", bg.filename);
                              store.updateSetting("showBlurredBg", false);
                              store.setActiveTab("studio");
                            }
                          }}
                          className={`flex-1 text-xs gap-1 h-7 font-bold cursor-pointer active:scale-[0.97] transition-all ${
                            isSelected
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3" /> Selected
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" /> Use in Studio
                            </>
                          )}
                        </Button>

                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              playClick();
                              navigator.clipboard.writeText(bg.filename);
                              setCopiedFile(bg.filename);
                              setTimeout(() => setCopiedFile(null), 2000);
                            }}
                            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97]"
                            title="Copy Filename"
                          >
                            {copiedFile === bg.filename ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(bg.filename)}
                            className="size-7 text-muted-foreground hover:text-destructive cursor-pointer active:scale-[0.97]"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </FramePanel>
                </Frame>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox High-Res Asset Inspection Modal */}
      {lightboxBg && (
        <Dialog open={!!lightboxBg} onOpenChange={() => setLightboxBg(null)}>
          <DialogContent className="max-w-xl w-full bg-card border-border/80 p-5 rounded-2xl shadow-2xl">
            <DialogHeader className="pb-1">
              <DialogTitle className="text-base font-bold flex items-center justify-between gap-2">
                <span className="truncate">{lightboxBg.name}</span>
                <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary shrink-0">
                  {formatFileSize(lightboxBg.sizeBytes)}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono truncate">
                {lightboxBg.filename}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-2">
              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden border border-border/80 bg-neutral-950 flex items-center justify-center shadow-xl">
                <img src={lightboxBg.url} alt={lightboxBg.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLightboxBg(null)}
                  className="text-xs font-semibold h-8 px-4"
                >
                  Close
                </Button>

                <Button
                  onClick={() => {
                    playClick();
                    store.updateSetting("bgType", "custom");
                    store.updateSetting("customBgImage", lightboxBg.filename);
                    store.updateSetting("showBlurredBg", false);
                    store.setActiveTab("studio");
                    setLightboxBg(null);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 h-8 px-5 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Apply &amp; Open in Studio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
