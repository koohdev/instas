"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Circle,
  Copy,
  Check,
  Trash2,
  Calendar as CalendarIcon,
  Folder,
  FolderOpen,
  Layers,
  Sparkles,
  Download,
  Link2,
  Hash,
  FileText,
} from "lucide-react";
import type { OutputBatchItem } from "@/app/api/outputs/route";

interface OutputSlideDrawerProps {
  item: OutputBatchItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (folderName: string, status: "not_posted" | "posted" | "scheduled", scheduledDate?: string) => void;
  onDelete: (folderName: string) => void;
}

/** Derive Instagram caption + hashtags from item metadata */
function buildCaption(item: OutputBatchItem): { caption: string; hashtags: string } {
  const titleLower = (item.title + " " + (item.category || "")).toLowerCase();

  const bullets = [
    `• ${item.title} — curated breakdown`,
    `• ${item.slideCount} slides packed with design insights you can use today`,
    `• Save this post & share it with someone building their next project`,
  ];

  const caption = `${item.title}\n\n${bullets.join("\n")}\n\nSwipe through all ${item.slideCount} slides >`;

  // Comprehensive design & web dev hashtag pool
  const coreTags = [
    "#framer",
    "#framertemplates",
    "#landingpage",
    "#webdesign",
    "#designresources",
    "#craftwork",
    "#portfolio",
    "#websitetemplate",
    "#uiux",
    "#startupdesign",
    "#agencywebsite",
    "#nocode",
    "#webdevelopment",
    "#freelancedesigner",
    "#designinspiration",
    "#framermotion",
    "#websitedesign",
    "#creativeassets",
    "#designtools",
    "#digitaldesign",
  ];

  // Specific contextual tags based on category or title
  const contextualSet = new Set<string>(coreTags);

  if (item.category) {
    const cleanCat = `#${item.category.toLowerCase().replace(/[\s-]+/g, "").replace(/[^a-z0-9]/g, "")}`;
    if (cleanCat.length > 1) contextualSet.add(cleanCat);
  }

  const hashtags = Array.from(contextualSet).join(" ");
  return { caption, hashtags };
}

export function OutputSlideDrawer({
  item,
  open,
  onOpenChange,
  onUpdateStatus,
  onDelete,
}: OutputSlideDrawerProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [copiedPath, setCopiedPath] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  if (!item) return null;

  const currentSlide = item.slides[activeSlideIdx] || item.slides[0];
  const imageUrl = `/api/outputs/image?folder=${encodeURIComponent(item.folderName)}&file=${encodeURIComponent(currentSlide)}`;

  const handleNext = () => {
    setActiveSlideIdx((prev) => (prev + 1) % item.slides.length);
  };

  const handlePrev = () => {
    setActiveSlideIdx((prev) => (prev - 1 + item.slides.length) % item.slides.length);
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { caption, hashtags } = buildCaption(item);
  const fullCaptionText = `${caption}\n\n${hashtags}`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(fullCaptionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/outputs?folder=${encodeURIComponent(item.folderName)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-card border-l border-border/80 shadow-2xl">
          <SheetHeader className="p-4 border-b border-border/60 bg-muted/30">
            <div className="flex items-start justify-between gap-2 pr-6">
              <div>
                <SheetTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{item.title}</span>
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Created {formattedDate}
                </SheetDescription>
              </div>

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`text-xs font-semibold px-2.5 py-0.5 capitalize shrink-0 ${
                  item.status === "posted"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : item.status === "scheduled"
                    ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {item.status === "posted" ? "🟢 Posted" : item.status === "scheduled" ? "🔵 Scheduled" : "⚪ Not Posted"}
              </Badge>
            </div>
          </SheetHeader>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {/* Status Selector Bar */}
            <div className="flex flex-col gap-2 bg-muted/40 p-3 rounded-xl border border-border/60">
              <span className="text-xs font-semibold text-foreground/80 flex items-center justify-between">
                <span>Publication Status</span>
                <span className="text-[11px] font-mono text-muted-foreground">{item.slideCount} Slides Total</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={item.status === "not_posted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(item.folderName, "not_posted")}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  <Circle className="w-3.5 h-3.5 opacity-60" /> Not Posted
                </Button>

                <Button
                  variant={item.status === "posted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(item.folderName, "posted")}
                  className={`h-8 text-xs font-semibold gap-1.5 ${
                    item.status === "posted" ? "bg-emerald-600 hover:bg-emerald-600 text-white" : ""
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Posted
                </Button>

                <Button
                  variant={item.status === "scheduled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    onUpdateStatus(item.folderName, "scheduled", item.scheduledDate || today);
                  }}
                  className={`h-8 text-xs font-semibold gap-1.5 ${
                    item.status === "scheduled" ? "bg-blue-600 hover:bg-blue-600 text-white" : ""
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Scheduled
                </Button>
              </div>

              {item.status === "scheduled" && (
                <div className="flex items-center gap-2 mt-1.5 pt-2 border-t border-border/40">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Post Date:</span>
                  <input
                    type="date"
                    value={item.scheduledDate ? item.scheduledDate.split("T")[0] : ""}
                    onChange={(e) => onUpdateStatus(item.folderName, "scheduled", e.target.value)}
                    className="bg-background border border-border/60 rounded px-2 py-0.5 text-xs font-mono text-foreground outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* High Resolution Slide Previewer */}
            <div className="flex flex-col gap-3">
              {/* Framed Slide Card Panel */}
              <div className="p-2 rounded-2xl border border-border/70 bg-card/60 shadow-sm">
                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden flex items-center justify-center group bg-black/40">
                  <img
                    src={imageUrl}
                    alt={`Slide ${activeSlideIdx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />

                  {/* Navigation Arrows */}
                  {item.slides.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur hover:bg-background opacity-80 hover:opacity-100 transition-opacity"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur hover:bg-background opacity-80 hover:opacity-100 transition-opacity"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur border border-border/50 rounded-full px-3 py-0.5 text-[11px] font-mono font-bold text-foreground shadow-sm">
                    Slide {activeSlideIdx + 1} of {item.slides.length}
                  </div>
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex items-center gap-2.5 overflow-x-auto p-1.5 max-w-full">
                {item.slides.map((s, idx) => {
                  const thumbUrl = `/api/outputs/image?folder=${encodeURIComponent(item.folderName)}&file=${encodeURIComponent(s)}`;
                  return (
                    <button
                      key={s}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`relative aspect-[4/5] w-14 shrink-0 rounded-lg overflow-hidden transition-all cursor-pointer ${
                        activeSlideIdx === idx
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-card opacity-100 scale-105"
                          : "opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={thumbUrl} alt={s} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-mono text-center py-0.5">
                        #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════ */}
            {/* AUTO-GENERATED INSTAGRAM CAPTION BOX                 */}
            {/* ══════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-3 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 p-3.5 rounded-xl border border-pink-500/20">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  Auto-Generated Instagram Caption
                </div>
                <Badge variant="outline" className="text-[9px] border-pink-500/30 text-pink-400/80">
                  AI Draft
                </Badge>
              </div>

              {/* Caption preview box */}
              <div className="bg-background/60 border border-border/50 rounded-lg p-3 text-xs text-foreground/80 leading-relaxed font-normal whitespace-pre-wrap select-text">
                {caption}
              </div>

              {/* Hashtags */}
              <div className="flex items-start gap-2">
                <Hash className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-[11px] text-blue-400/90 font-medium leading-relaxed">
                  {hashtags}
                </div>
              </div>

              {/* Copy Caption button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCaption}
                className="w-full h-8 text-xs font-semibold gap-2 border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 cursor-pointer active:scale-[0.97] transition-all"
              >
                {copiedCaption ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /> Caption Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy Caption &amp; Hashtags</>
                )}
              </Button>
            </div>

            {/* Folder & Path Details */}
            <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-xl border border-border/50">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      window.location.href = `/api/outputs/download?folder=${encodeURIComponent(item.folderName)}`;
                    }}
                    className="h-8 px-3 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer active:scale-[0.97] transition-all"
                  >
                    <Download className="w-4 h-4" /> Download Slides (.ZIP)
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetch("/api/outputs/open", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ folderName: item.folderName }),
                      }).catch(() => {});
                    }}
                    className="h-8 px-3 text-xs font-bold gap-1.5 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 cursor-pointer active:scale-[0.97]"
                  >
                    <FolderOpen className="w-4 h-4" /> Open Folder
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(item.folderPath);
                    setCopiedPath(true);
                    setTimeout(() => setCopiedPath(false), 2000);
                  }}
                  className="h-8 px-2.5 text-xs gap-1 font-semibold text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97]"
                >
                  {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPath ? "Copied Path" : "Copy Path"}
                </Button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* ONE-CLICK CTA BAR (sticky above footer)              */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="px-4 py-3 border-t border-border/40 bg-gradient-to-r from-muted/20 via-card to-muted/20">
            <div className="grid grid-cols-3 gap-2">
              {/* Copy Caption */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCaption}
                className="h-9 text-xs font-semibold gap-1.5 cursor-pointer active:scale-[0.97] transition-all"
              >
                {copiedCaption ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy Caption</>
                )}
              </Button>

              {/* Download All Slides — primary CTA */}
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  window.location.href = `/api/outputs/download?folder=${encodeURIComponent(item.folderName)}`;
                }}
                className="h-9 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer active:scale-[0.97] transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download All (.zip)
              </Button>

              {/* Share Link */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className="h-9 text-xs font-semibold gap-1.5 cursor-pointer active:scale-[0.97] transition-all"
              >
                {copiedShareLink ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /> Link Copied!</>
                ) : (
                  <><Link2 className="w-3.5 h-3.5" /> Share Link</>
                )}
              </Button>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Folder
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs font-semibold">
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Output Folder?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to permanently delete <strong className="text-foreground">{item.title}</strong> and all its {item.slideCount} generated slide files from disk? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setShowConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setShowConfirmDelete(false);
                onOpenChange(false);
                onDelete(item.folderName);
              }}
              className="font-bold"
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
