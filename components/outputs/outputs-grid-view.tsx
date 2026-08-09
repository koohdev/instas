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
  onSelectBatch: (item: OutputBatchItem) => void;
  onUpdateStatus: (folderName: string, status: "not_posted" | "posted" | "scheduled", scheduledDate?: string) => void;
  onDelete: (folderName: string) => void;
}

export function OutputsGridView({
  items,
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

        const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <Card
            key={item.folderName}
            className="group relative flex flex-col p-3 gap-3 overflow-hidden border border-border/70 bg-card hover:border-border transition-all duration-200"
          >
            {/* Inner Cover Card Frame */}
            <div
              onClick={() => onSelectBatch(item)}
              className="relative aspect-[4/5] w-full rounded-xl border border-border/60 bg-muted/40 overflow-hidden cursor-pointer flex items-center justify-center shadow-xs"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

              {/* Status Radio Pills */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
                  <button
                    onClick={() => onUpdateStatus(item.folderName, "not_posted")}
                    className={`flex-1 text-[10px] font-semibold py-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      item.status === "not_posted"
                        ? "bg-background text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Circle className="w-2.5 h-2.5" /> Not Posted
                  </button>

                  <button
                    onClick={() => onUpdateStatus(item.folderName, "posted")}
                    className={`flex-1 text-[10px] font-semibold py-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      item.status === "posted"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" /> Posted
                  </button>

                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      onUpdateStatus(item.folderName, "scheduled", item.scheduledDate || today);
                    }}
                    className={`flex-1 text-[10px] font-semibold py-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      item.status === "scheduled"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" /> Scheduled
                  </button>
                </div>

                {/* Bottom Card Actions */}
                <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/api/outputs/download?folder=${encodeURIComponent(item.folderName)}`;
                      }}
                      className="h-6 px-2 text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border-emerald-500/30 gap-1 font-semibold cursor-pointer active:scale-[0.97] transition-all"
                      title="Download all slides as ZIP archive"
                    >
                      <Download className="w-3 h-3 text-emerald-400" /> Download ZIP
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenFolder(item.folderName)}
                      className="h-6 px-2 text-[10px] text-foreground hover:bg-primary/10 hover:text-primary border-border/60 gap-1 font-semibold cursor-pointer active:scale-[0.97] transition-all"
                      title="Open Native Windows Explorer Folder"
                    >
                      <FolderOpen className="w-3 h-3 text-primary" /> Folder
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(item.folderPath);
                        setCopiedFolder(item.folderName);
                        setTimeout(() => setCopiedFolder(null), 2000);
                      }}
                      className="size-6 text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97]"
                      title="Copy Folder Path"
                    >
                      {copiedFolder === item.folderName ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDelete(item.folderName)}
                      className="size-6 text-muted-foreground hover:text-destructive cursor-pointer active:scale-[0.97]"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
