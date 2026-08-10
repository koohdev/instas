"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Circle,
  Copy,
  Check,
  Eye,
  Trash2,
  Folder,
  FolderOpen,
  Layers,
  Download,
} from "lucide-react";
import type { OutputBatchItem } from "@/app/api/outputs/route";

interface OutputsGridViewProps {
  items: OutputBatchItem[];
  loading?: boolean;
  onSelectBatch: (item: OutputBatchItem) => void;
  onUpdateStatus: (folderName: string, status: "not_posted" | "posted" | "scheduled", scheduledDate?: string) => void;
  onDelete: (folderName: string) => void;
}

// Shimmer skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="flex flex-col p-3 gap-3 rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Cover skeleton */}
      <div className="relative aspect-[4/5] w-full rounded-xl bg-muted/60 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/6 to-transparent" />
        {/* Top badge stubs */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
          <div className="h-4 w-12 rounded-full bg-white/10 animate-pulse" />
          <div className="h-4 w-14 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
      {/* Text stubs */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="h-3 w-3/4 rounded bg-muted/80 animate-pulse" />
        <div className="h-2.5 w-1/3 rounded bg-muted/60 animate-pulse" />
      </div>
      {/* Status pill stub */}
      <div className="h-7 w-full rounded-lg bg-muted/60 animate-pulse mt-1" />
      {/* Action stubs */}
      <div className="flex gap-2 mt-1">
        <div className="h-6 flex-1 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-6 flex-1 rounded-md bg-muted/50 animate-pulse" />
      </div>
    </div>
  );
}

export function OutputsGridView({
  items,
  loading = false,
  onSelectBatch,
  onUpdateStatus,
  onDelete,
}: OutputsGridViewProps) {
  const [copiedFolder, setCopiedFolder] = useState<string | null>(null);

  const handleOpenFolder = (folderName: string) => {
    fetch("/api/outputs/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderName }),
    }).catch(() => {});
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl bg-card/40 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Folder className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No Generated Outputs Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          No carousel outputs match your current filter. Generate carousels in the Studio tab to view them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {items.map((item) => {
        const coverUrl = item.coverImage
          ? `/api/outputs/image?folder=${encodeURIComponent(item.folderName)}&file=${encodeURIComponent(item.coverImage)}`
          : "";
        // Slide 2 and 3 URLs for fan-out layers
        const slide2Url = item.slides[1]
          ? `/api/outputs/image?folder=${encodeURIComponent(item.folderName)}&file=${encodeURIComponent(item.slides[1])}`
          : coverUrl;
        const slide3Url = item.slides[2]
          ? `/api/outputs/image?folder=${encodeURIComponent(item.folderName)}&file=${encodeURIComponent(item.slides[2])}`
          : coverUrl;
        const hasMultipleSlides = item.slideCount > 1;

        const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <Card
            key={item.folderName}
            className="group relative flex flex-col p-3 gap-3 overflow-visible border border-border/70 bg-card hover:border-border transition-all duration-200"
          >
            {/* ═══════════════════════════════════════════ */}
            {/* 3D STACKED CARD DECK (multi-slide only)    */}
            {/* ═══════════════════════════════════════════ */}

            {/* Ghost layer 3 — furthest back */}
            {hasMultipleSlides && slide3Url && (
              <div
                className="absolute inset-x-3 top-3 aspect-[4/5] rounded-xl overflow-hidden border border-border/50 bg-muted/20 z-[-2] shadow-sm
                  translate-x-[6px] translate-y-[6px] rotate-[2.5deg] scale-[0.97]
                  group-hover:translate-x-[18px] group-hover:rotate-[5deg] group-hover:translate-y-[2px]
                  transition-all duration-300 ease-out pointer-events-none"
              >
                <img src={slide3Url} alt="" className="w-full h-full object-cover opacity-60" />
              </div>
            )}

            {/* Ghost layer 2 — middle */}
            {hasMultipleSlides && slide2Url && (
              <div
                className="absolute inset-x-3 top-3 aspect-[4/5] rounded-xl overflow-hidden border border-border/60 bg-muted/30 z-[-1] shadow-md
                  translate-x-[3px] translate-y-[3px] rotate-[1.2deg] scale-[0.98]
                  group-hover:translate-x-[9px] group-hover:rotate-[2.5deg] group-hover:translate-y-[1px]
                  transition-all duration-300 ease-out pointer-events-none"
              >
                <img src={slide2Url} alt="" className="w-full h-full object-cover opacity-75" />
              </div>
            )}

            {/* Main cover card — z-10, lifts up on hover */}
            <div
              onClick={() => onSelectBatch(item)}
              className="relative aspect-[4/5] w-full rounded-xl border border-border/60 bg-muted/40 overflow-hidden cursor-pointer flex items-center justify-center shadow-xl
                group-hover:-translate-y-1 group-hover:shadow-2xl
                transition-all duration-300 ease-out z-10"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Layers className="w-8 h-8 opacity-40" />
                  <span className="text-xs font-mono">No Preview</span>
                </div>
              )}

              {/* Top Badges */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                <Badge
                  variant="secondary"
                  className="bg-black/70 backdrop-blur-md text-white border border-white/20 font-mono text-[10px] px-2 py-0.5"
                >
                  {item.slideCount} Slides
                </Badge>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold px-2 py-0.5 backdrop-blur-md shadow-sm ${
                    item.status === "posted"
                      ? "bg-emerald-500/90 text-white border-emerald-400"
                      : item.status === "scheduled"
                      ? "bg-blue-500/90 text-white border-blue-400"
                      : "bg-black/70 text-gray-200 border-white/20"
                  }`}
                >
                  {item.status === "posted" ? "Posted" : item.status === "scheduled" ? "Scheduled" : "Not Posted"}
                </Badge>
              </div>

              {/* Hover Quick View Overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-bold shadow-lg">
                  <Eye className="w-3.5 h-3.5" /> Inspect Slides
                </Button>
              </div>
            </div>

            {/* Content Body */}
            <CardContent className="p-0 flex flex-col gap-3 flex-1 justify-between">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h4
                    onClick={() => onSelectBatch(item)}
                    className="text-xs font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  >
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{dateStr}</span>
                </div>

              </div>

              {/* Status Switcher & Action Buttons (Screenshot Spec) */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-border dark:border-[#27272A] w-full">
                {/* Status Switcher Pill Bar */}
                <div className="flex items-center h-9 p-0.5 bg-muted/60 dark:bg-[#09090B] border border-border dark:border-[#27272A] rounded-xl w-full justify-between gap-0.5">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(item.folderName, "not_posted")}
                    className={`flex-1 h-full text-xs font-bold rounded-[6px] transition-all flex items-center justify-center cursor-pointer ${
                      item.status === "not_posted"
                        ? "bg-[#F59E0B] text-black font-extrabold shadow-xs"
                        : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                    }`}
                  >
                    Not Posted
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateStatus(item.folderName, "posted")}
                    className={`flex-1 h-full text-xs font-bold rounded-[6px] transition-all flex items-center justify-center cursor-pointer ${
                      item.status === "posted"
                        ? "bg-[#10B981] text-black font-extrabold shadow-xs"
                        : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                    }`}
                  >
                    Posted
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      onUpdateStatus(item.folderName, "scheduled", item.scheduledDate || today);
                    }}
                    className={`flex-1 h-full text-xs font-bold rounded-[6px] transition-all flex items-center justify-center cursor-pointer ${
                      item.status === "scheduled"
                        ? "bg-[#3B82F6] text-white font-extrabold shadow-xs"
                        : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
                    }`}
                  >
                    Scheduled
                  </button>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center h-[42px] gap-2 w-full">
                  {/* Download ZIP */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/api/outputs/download?folder=${encodeURIComponent(item.folderName)}`;
                    }}
                    className={`flex-1 h-full rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] hover:bg-muted dark:hover:bg-[#18181B] hover:border-border dark:hover:border-[#3F3F46] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] ${
                      item.status === "posted"
                        ? "text-[#10B981]"
                        : item.status === "scheduled"
                        ? "text-[#3B82F6]"
                        : "text-[#F59E0B]"
                    }`}
                    title="Download ZIP"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ZIP</span>
                  </button>

                  {/* Open Folder */}
                  <button
                    type="button"
                    onClick={() => handleOpenFolder(item.folderName)}
                    className="h-full px-3.5 rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-foreground dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-muted dark:hover:bg-[#18181B] hover:border-border dark:hover:border-[#3F3F46] cursor-pointer transition-all active:scale-[0.98] shrink-0"
                    title="Open Folder"
                  >
                    <Folder className="w-4 h-4 text-foreground dark:text-white" />
                    <span>Folder</span>
                  </button>

                  {/* Copy Path */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.folderPath);
                      setCopiedFolder(item.folderName);
                      setTimeout(() => setCopiedFolder(null), 2000);
                    }}
                    className="h-full aspect-square rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-foreground dark:text-white flex items-center justify-center hover:bg-muted dark:hover:bg-[#18181B] hover:border-border dark:hover:border-[#3F3F46] cursor-pointer transition-all active:scale-[0.98] shrink-0"
                    title="Copy Folder Path"
                  >
                    {copiedFolder === item.folderName ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-foreground dark:text-white" />
                    )}
                  </button>

                  {/* Delete Folder */}
                  <button
                    type="button"
                    onClick={() => onDelete(item.folderName)}
                    className="h-full aspect-square rounded-xl bg-background dark:bg-[#09090B] border border-border dark:border-[#27272A] text-foreground dark:text-white flex items-center justify-center hover:bg-muted dark:hover:bg-[#18181B] hover:border-red-500/40 hover:text-red-500 cursor-pointer transition-all active:scale-[0.98] shrink-0"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
