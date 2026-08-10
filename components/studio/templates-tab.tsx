"use client";

import { useState } from "react";
import {
  Layers,
  Play,
  Trash2,
  Plus,
  Edit2,
  Eye,
  Bookmark,
  ArrowRight,
  Send,
  Sparkles,
  Heart,
  Tag,
  Search,
  CheckCircle2,
  Sliders,
  Palette,
  Layout,
  Check,
  SquarePen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { TemplateManager } from "./template-manager";
import { TemplateEditorView } from "./template-editor-view";
import type { DesignTemplate } from "@/lib/templateStore";

export function TemplatesTab() {
  const store = useAppStore();
  const { playClick } = useSoundEffects();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DesignTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [previewSlideMode, setPreviewSlideMode] = useState<"cover" | "content">("cover");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "active" | "default" | "custom">("all");

  const handleDelete = async (id: string) => {
    playClick();
    const updated = store.templates.filter((t) => t.id !== id);
    useAppStore.setState({ templates: updated });
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templates: updated }),
    });
  };

  const handleApply = (item: DesignTemplate) => {
    playClick();
    store.applyTemplate(item);
    store.setActiveTab("studio");
  };

  // Filter templates
  const filteredTemplates = store.templates.filter((item) => {
    const isActive = store.activeTemplateId === item.id;
    if (filterCategory === "active" && !isActive) return false;
    if (filterCategory === "default" && !item.isDefault) return false;
    if (filterCategory === "custom" && item.isDefault) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.fontFamily && item.fontFamily.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // IF EDITING A TEMPLATE: Render TemplateEditorView
  if (editingTemplate) {
    return (
      <TemplateEditorView
        template={editingTemplate}
        onBack={() => setEditingTemplate(null)}
      />
    );
  }

  const activeTemplate = store.templates.find((t) => t.id === store.activeTemplateId);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200 pb-12">
      {/* Hero Header Banner */}
      <Frame variant="default" spacing="default" className="w-full">
        <FramePanel className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                    Design Templates Hub
                  </h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-2 py-0.5">
                    {store.templates.length} Preset{store.templates.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  Visually edit typography, branding overlays, backgrounds, and layout styles for Instagram carousels.
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                playClick();
                setIsDialogOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-bold h-9 px-4 cursor-pointer active:scale-[0.97] shadow-sm w-full sm:w-auto shrink-0 justify-center"
            >
              <Plus className="w-4 h-4" /> Save Current as Template
            </Button>
          </div>
        </FramePanel>
      </Frame>

      {/* Control Bar: Search & Filter Tabs - Responsive Mobile Stacking Spec */}
      <Frame variant="default" spacing="default" className="w-full">
        <FramePanel className="p-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-[#A1A1AA]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-8 h-9 text-xs bg-background dark:bg-[#09090B] border-input dark:border-[#27272A] rounded-xl text-foreground dark:text-white w-full"
                />
              </div>

              {/* Category Pills - Responsive grid on mobile with rounded-[6px] active buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:flex items-center min-h-[36px] md:h-9 gap-0.5 bg-muted/60 dark:bg-[#09090B] p-0.5 rounded-xl border border-border dark:border-[#27272A] shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    playClick();
                    setFilterCategory("all");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3 rounded-[6px] transition-all flex items-center justify-center cursor-pointer w-full md:w-auto ${
                    filterCategory === "all"
                      ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
                      : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  All ({store.templates.length})
                </button>

                <button
                  onClick={() => {
                    playClick();
                    setFilterCategory("active");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3 rounded-[6px] transition-all inline-flex items-center justify-center gap-1 cursor-pointer w-full md:w-auto ${
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
                    setFilterCategory("default");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3 rounded-[6px] transition-all flex items-center justify-center cursor-pointer w-full md:w-auto ${
                    filterCategory === "default"
                      ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
                      : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  Default
                </button>

                <button
                  onClick={() => {
                    playClick();
                    setFilterCategory("custom");
                  }}
                  className={`h-8 md:h-full text-xs font-bold px-3 rounded-[6px] transition-all flex items-center justify-center cursor-pointer w-full md:w-auto ${
                    filterCategory === "custom"
                      ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
                      : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {activeTemplate && (
              <div className="h-9 ml-auto hidden lg:flex items-center gap-2 text-xs text-muted-foreground dark:text-[#A1A1AA] bg-background dark:bg-[#09090B] px-3.5 rounded-xl border border-border dark:border-[#27272A] shrink-0 font-mono">
                <span className="text-[11px]">Active Preset:</span>
                <span className="font-bold text-foreground dark:text-white uppercase">{activeTemplate.name}</span>
              </div>
            )}
          </div>
        </FramePanel>
      </Frame>

      {/* Template Cards Grid with Visual Mini-Canvas Previews */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl bg-card/40 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Templates Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            No design templates match your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5 w-full">
          {filteredTemplates.map((item) => {
            const isActive = store.activeTemplateId === item.id;
            return (
              <Frame
                key={item.id}
                variant="default"
                spacing="default"
                className={`group transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "ring-2 ring-primary border-primary/80 bg-primary/5 shadow-md"
                    : "hover:border-border/90 hover:shadow-md"
                }`}
              >
                <FramePanel className="gap-3.5 flex flex-col justify-between h-full p-4">
                  {/* Card Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground truncate">{item.name}</h4>
                        {isActive && (
                          <Badge className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description || "Carousel design template preset."}
                      </p>
                    </div>

                    {item.isDefault && (
                      <Badge
                        variant="outline"
                        className="border-primary/30 text-primary text-[9px] bg-primary/10 font-mono shrink-0"
                      >
                        Default
                      </Badge>
                    )}
                  </div>

                  {/* Visual Mini-Canvas Thumbnail (4:5 Ratio) */}
                  <div
                    onClick={() => {
                      playClick();
                      setPreviewTemplate(item);
                    }}
                    className="relative aspect-[4/5] w-full rounded-xl overflow-hidden border border-border/80 bg-[#0d0d0d] flex flex-col items-center justify-center p-4 cursor-pointer shadow-lg group-hover:border-primary/50 transition-all duration-300"
                    style={{
                      fontFamily: `'${item.fontFamily || "Inter"}', sans-serif`,
                    }}
                  >
                    {/* Visual Background */}
                    {item.bgType === "custom" && item.customBgImage && (
                      <img
                        src={`/api/backgrounds/${encodeURIComponent(item.customBgImage)}`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div
                      className="absolute inset-0 z-0 pointer-events-none opacity-80"
                      style={{
                        background:
                          item.coverStyle === "bold"
                            ? "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.35) 0%, transparent 60%)"
                            : item.coverStyle === "minimal"
                            ? "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.25) 0%, transparent 70%)"
                            : "radial-gradient(circle at 50% 30%, rgba(99,102,241,0.45) 0%, rgba(15,23,42,0.95) 70%)",
                      }}
                    />

                    {/* Mini Canvas Content Text */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center gap-1.5 w-full">
                      <h2 className="text-xs font-bold tracking-tight text-white leading-snug line-clamp-2">
                        {item.coverTitle || "STOP MAKING YOUR OWN COMPONENTS"}
                      </h2>
                      <p className="text-[9.5px] text-white/70 max-w-[220px] line-clamp-2 leading-tight">
                        {item.coverSubtitle || "A CURATED LIST OF HIGH-QUALITY UI KITS TO COPY AND PASTE"}
                      </p>
                    </div>

                    {/* Corner Branding Elements */}
                    <span className="absolute top-2.5 left-3 text-[8.5px] font-bold text-white/70 tracking-wider uppercase z-10">
                      {item.topLeftText || "INSTAS"}
                    </span>
                    <span className="absolute top-2.5 right-3 text-[8.5px] font-semibold text-white/60 tracking-wider uppercase z-10">
                      {item.topRightText || "RESOURCES"}
                    </span>
                    <span className="absolute bottom-2.5 left-3 text-[9px] font-semibold text-white/50 z-10">
                      01
                    </span>
                    <span className="absolute bottom-2.5 right-3 text-[8.5px] font-medium text-white/60 z-10 flex items-center gap-1">
                      {item.bottomRightIcon === "arrow-right" && <ArrowRight className="w-2.5 h-2.5 text-white/80" />}
                      {item.bottomRightIcon === "send" && <Send className="w-2.5 h-2.5 text-white/80" />}
                      {item.bottomRightIcon === "sparkles" && <Sparkles className="w-2.5 h-2.5 text-white/80" />}
                      {item.bottomRightIcon === "heart" && <Heart className="w-2.5 h-2.5 text-white/80" />}
                      {item.bottomRightIcon === "tag" && <Tag className="w-2.5 h-2.5 text-white/80" />}
                      {(!item.bottomRightIcon || item.bottomRightIcon === "bookmark") && (
                        <Bookmark className="w-2.5 h-2.5 text-white/80" />
                      )}
                    </span>

                    {/* Inspect Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <Button variant="secondary" size="xs" className="gap-1 text-[11px] font-bold shadow-lg">
                        <Eye className="w-3 h-3 text-primary" /> Live Preview
                      </Button>
                    </div>
                  </div>

                  {/* Specs Pill Bar (Screenshot Spec) */}
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-[11px] font-sans text-[#FAFAFA] w-full gap-2 overflow-x-auto">
                    <div className="truncate shrink min-w-0">
                      <span className="text-[#A1A1AA]">Font:</span>{" "}
                      <span className="font-semibold text-[#FAFAFA] truncate">{item.fontFamily || "Inter"}</span>
                    </div>
                    <div className="shrink-0 text-center">
                      <span className="text-[#A1A1AA]">Radius:</span>{" "}
                      <span className="font-semibold text-[#FAFAFA]">{item.borderRadius ?? 24}px</span>
                    </div>
                    <div className="shrink-0 text-center">
                      <span className="text-[#A1A1AA]">Blur:</span>{" "}
                      <span className="font-semibold text-[#FAFAFA]">{item.blurAmount ?? 0}px</span>
                    </div>
                    <div className="shrink-0 text-right uppercase">
                      <span className="text-[#A1A1AA]">Bg:</span>{" "}
                      <span className="font-bold text-[#FAFAFA]">{item.bgType || "CUSTOM"}</span>
                    </div>
                  </div>

                  {/* Action Buttons Row (Screenshot Spec) */}
                  <div className="flex items-center h-[42px] gap-2 pt-1 w-full">
                    <button
                      type="button"
                      onClick={() => handleApply(item)}
                      className={`flex-1 h-[33px] rounded-xl border border-transparent font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-[0.98] ${
                        isActive
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "bg-foreground text-background hover:bg-foreground/90"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Apply</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setPreviewTemplate(item);
                      }}
                      className="h-full px-3.5 rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-foreground dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-muted dark:hover:bg-[#18181B] hover:border-border dark:hover:border-[#3F3F46] cursor-pointer transition-all active:scale-[0.98] shrink-0"
                      title="Preview Template"
                    >
                      <Eye className="w-4 h-4 text-foreground dark:text-white" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setEditingTemplate(item);
                      }}
                      className="h-full aspect-square rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-foreground dark:text-white flex items-center justify-center hover:bg-muted dark:hover:bg-[#18181B] hover:border-border dark:hover:border-[#3F3F46] cursor-pointer transition-all active:scale-[0.98] shrink-0"
                      title="Edit Template Properties"
                    >
                      <SquarePen className="w-4 h-4 text-foreground dark:text-white" />
                    </button>

                    {!item.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="h-full aspect-square rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-muted-foreground dark:text-[#A1A1AA] hover:text-red-500 flex items-center justify-center hover:bg-muted dark:hover:bg-[#18181B] hover:border-red-500/40 cursor-pointer transition-all active:scale-[0.98] shrink-0"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </FramePanel>
              </Frame>
            );
          })}
        </div>
      )}

      {/* Save Template Dialog */}
      <TemplateManager open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Live Canvas Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-[460px] sm:max-w-[460px] w-full bg-card border-border/80 p-4 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <DialogHeader className="pb-0">
              <div className="flex items-center justify-between gap-3 pr-4">
                <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2 truncate">
                  <Eye className="w-4 h-4 text-primary shrink-0" /> Live Canvas: {previewTemplate.name}
                </DialogTitle>
                <Badge variant="outline" className="border-primary/40 text-primary text-[10px] uppercase shrink-0">
                  {previewTemplate.bgType || "gradient"}
                </Badge>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground pt-0.5">
                Preview how this template renders on live carousel slides.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-1">
              {/* Slide Mode Switcher */}
              <div className="flex items-center justify-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 w-full">
                <Button
                  variant={previewSlideMode === "cover" ? "default" : "ghost"}
                  size="xs"
                  onClick={() => {
                    playClick();
                    setPreviewSlideMode("cover");
                  }}
                  className="text-xs font-semibold h-7 flex-1"
                >
                  Cover Slide
                </Button>
                <Button
                  variant={previewSlideMode === "content" ? "default" : "ghost"}
                  size="xs"
                  onClick={() => {
                    playClick();
                    setPreviewSlideMode("content");
                  }}
                  className="text-xs font-semibold h-7 flex-1"
                >
                  Content Slide (01)
                </Button>
              </div>

              {/* Live Canvas Box */}
              <div className="p-2 rounded-xl border border-border/70 bg-card/80 shadow-md">
                <div
                  className="relative aspect-[4/5] w-full rounded-lg overflow-hidden border border-border/80 bg-[#0d0d0d] flex flex-col items-center justify-center p-6 transition-all duration-300 shadow-xl"
                  style={{
                    fontFamily: `'${previewTemplate.fontFamily || "Inter"}', sans-serif`,
                  }}
                >
                  {/* Visual Background */}
                  {previewTemplate.bgType === "custom" && previewTemplate.customBgImage && (
                    <img
                      src={`/api/backgrounds/${encodeURIComponent(previewTemplate.customBgImage)}`}
                      alt="Template Background"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-80"
                    style={{
                      background:
                        previewTemplate.coverStyle === "bold"
                          ? "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.3) 0%, transparent 60%)"
                          : previewTemplate.coverStyle === "minimal"
                          ? "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.2) 0%, transparent 70%)"
                          : "radial-gradient(circle at 50% 30%, rgba(99,102,241,0.4) 0%, rgba(15,23,42,0.9) 70%)",
                    }}
                  />

                  {/* Canvas Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2.5 w-full">
                    {previewSlideMode === "cover" ? (
                      <>
                        <h2 className="text-lg font-bold tracking-tight text-white leading-snug">
                          {previewTemplate.coverTitle || "STOP MAKING YOUR OWN COMPONENTS"}
                        </h2>
                        <p className="text-[11px] text-white/70 max-w-[280px] leading-relaxed">
                          {previewTemplate.coverSubtitle || "A CURATED LIST OF HIGH-QUALITY UI KITS & DESIGN TOOLS TO COPY AND PASTE"}
                        </p>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-[10px] mb-0.5">
                          Resource #01
                        </Badge>
                        <h3 className="text-base font-bold text-white">Shadcn / UI Library</h3>
                        <p className="text-[11px] text-white/70 max-w-[280px] leading-relaxed">
                          Beautifully designed components that you can copy and paste into your apps.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Canvas Branding Corner Elements */}
                  <span className="absolute top-3.5 left-4 text-[10px] font-bold text-white/70 tracking-wider uppercase z-10">
                    {previewTemplate.topLeftText || "INSTAS"}
                  </span>
                  <span className="absolute top-3.5 right-4 text-[10px] font-semibold text-white/60 tracking-wider uppercase z-10">
                    {previewTemplate.topRightText || "RESOURCES"}
                  </span>
                  <span className="absolute bottom-3.5 left-4 text-[10.5px] font-semibold text-white/50 z-10">
                    01
                  </span>
                  <span className="absolute bottom-3.5 right-4 text-[10px] font-medium text-white/60 z-10 flex items-center gap-1.5">
                    {previewTemplate.bottomRightText && <span>{previewTemplate.bottomRightText}</span>}
                    {previewTemplate.bottomRightIcon === "arrow-right" && <ArrowRight className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "send" && <Send className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "sparkles" && <Sparkles className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "heart" && <Heart className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "tag" && <Tag className="w-3.5 h-3.5 text-white/80" />}
                    {(!previewTemplate.bottomRightIcon || previewTemplate.bottomRightIcon === "bookmark") && (
                      <Bookmark className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                  className="text-xs font-semibold h-8 px-3 cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleApply(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 h-8 px-4 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Apply Template to Studio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
