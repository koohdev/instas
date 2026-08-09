"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  Circle,
  Copy,
  Check,
  Eye,
  Trash2,
  ChevronDown,
  Layers,
  Folder,
  Download,
} from "lucide-react";
import type { OutputBatchItem } from "@/app/api/outputs/route";

interface OutputsTableViewProps {
  items: OutputBatchItem[];
  onSelectBatch: (item: OutputBatchItem) => void;
  onUpdateStatus: (folderName: string, status: "not_posted" | "posted" | "scheduled", scheduledDate?: string) => void;
  onDelete: (folderName: string) => void;
}

export function OutputsTableView({
  items,
  onSelectBatch,
  onUpdateStatus,
  onDelete,
}: OutputsTableViewProps) {
  const [copiedFolder, setCopiedFolder] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl bg-card/40 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Folder className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No Output Batches Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          No generated outputs match your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground font-semibold">
              <th className="py-3 px-4 w-16">Preview</th>
              <th className="py-3 px-4">Carousel Batch Title</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-28 text-center">Slides</th>
              <th className="py-3 px-4 w-36">Created Date</th>
              <th className="py-3 px-4 w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
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
                <tr
                  key={item.folderName}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Thumbnail Preview */}
                  <td className="py-2.5 px-4">
                    <div
                      onClick={() => onSelectBatch(item)}
                      className="relative aspect-[4/5] w-10 rounded-md border border-border/60 bg-black/40 overflow-hidden cursor-pointer shrink-0"
                    >
                      {coverUrl ? (
                        <img src={coverUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Layers className="w-4 h-4 opacity-40" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Path */}
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col min-w-0">
                      <span
                        onClick={() => onSelectBatch(item)}
                        className="font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors text-xs"
                      >
                        {item.title}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate max-w-xs">
                        {item.folderName}
                      </span>
                    </div>
                  </td>

                  {/* Status Dropdown Picker */}
                  <td className="py-2.5 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={`h-7 px-2 text-[11px] font-semibold flex items-center justify-between rounded-md border w-28 transition-colors cursor-pointer ${
                          item.status === "posted"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : item.status === "scheduled"
                            ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                            : "bg-muted/60 border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-1 truncate">
                          {item.status === "posted" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : item.status === "scheduled" ? (
                            <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                          ) : (
                            <Circle className="w-3 h-3 opacity-60 shrink-0" />
                          )}
                          <span className="capitalize">{item.status.replace("_", " ")}</span>
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-36">
                        <DropdownMenuItem onClick={() => onUpdateStatus(item.folderName, "not_posted")}>
                          <Circle className="w-3.5 h-3.5 opacity-60 mr-1.5" /> Not Posted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(item.folderName, "posted")}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Posted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            onUpdateStatus(item.folderName, "scheduled", item.scheduledDate || today);
                          }}
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-400 mr-1.5" /> Scheduled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>

                  {/* Slide Count */}
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5 bg-primary/10 text-primary">
                      {item.slideCount} Slides
                    </Badge>
                  </td>

                  {/* Date Created */}
                  <td className="py-2.5 px-4 text-muted-foreground font-mono text-[11px]">
                    {dateStr}
                  </td>

                  {/* Row Actions */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          window.location.href = `/api/outputs/download?folder=${encodeURIComponent(item.folderName)}`;
                        }}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer active:scale-[0.97]"
                        title="Download Slides as ZIP Archive"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onSelectBatch(item)}
                        className="cursor-pointer active:scale-[0.97]"
                        title="Inspect Slides"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(item.folderPath);
                          setCopiedFolder(item.folderName);
                          setTimeout(() => setCopiedFolder(null), 2000);
                        }}
                        className="cursor-pointer active:scale-[0.97]"
                        title="Copy Path"
                      >
                        {copiedFolder === item.folderName ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDelete(item.folderName)}
                        className="hover:text-destructive cursor-pointer active:scale-[0.97]"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
