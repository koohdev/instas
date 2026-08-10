"use client";

import { useState } from "react";
import { Plus, Play, Trash2, X, CheckCheck, Loader2, AlertCircle, Clock, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useAppStore } from "@/lib/store";
import type { BatchQueueItem } from "@/lib/types";

function StatusIcon({ status }: { status: BatchQueueItem["status"] }) {
  if (status === "pending") return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
  if (status === "running") return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />;
  if (status === "done") return <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === "error") return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
  return null;
}

function StatusBadge({ status }: { status: BatchQueueItem["status"] }) {
  const map: Record<BatchQueueItem["status"], { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-muted text-muted-foreground border-border" },
    running: { label: "Running", className: "bg-primary/15 text-primary border-primary/40 animate-pulse" },
    done: { label: "Done", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" },
    error: { label: "Error", className: "bg-destructive/15 text-destructive border-destructive/40" },
  };
  const { label, className } = map[status];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${className}`}>
      {label}
    </Badge>
  );
}

export function BatchQueuePanel() {
  const store = useAppStore();

  const hasPending = store.batchQueue.some((i) => i.status === "pending");
  const hasItems = store.batchQueue.length > 0;

  const handleRunQueue = async () => {
    await store.runBatchQueue();
  };

  return (
    <Frame variant="default" spacing="sm">
      <FramePanel dense>
        <div className="flex flex-col gap-4 p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
                <List className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Batch Queue</h3>
                <p className="text-[10px] text-muted-foreground">Paste multiple URL sets to auto-generate carousels</p>
              </div>
            </div>
            {hasItems && (
              <Button
                variant="ghost"
                size="sm"
                onClick={store.clearBatchQueue}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </Button>
            )}
          </div>

          {/* Queue List */}
          {hasItems && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Queue ({store.batchQueue.length} items)
                </Label>
                <Button
                  size="sm"
                  onClick={handleRunQueue}
                  disabled={store.isQueueRunning || !hasPending}
                  className="h-7 px-3 text-[11px] gap-1.5"
                >
                  {store.isQueueRunning ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" /> Run All
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {store.batchQueue.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 30, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`flex items-start justify-between gap-2 p-3 rounded-xl border transition-colors ${
                          item.status === "running"
                            ? "border-primary/50 bg-primary/5"
                            : item.status === "done"
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : item.status === "error"
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-border/60 bg-card"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <StatusIcon status={item.status} />
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{item.batchName}</span>
                              <StatusBadge status={item.status} />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {item.urls.length} URL{item.urls.length !== 1 ? "s" : ""} → {item.urls.length + 1} slides
                            </span>
                            {item.status === "error" && item.errorMsg && (
                              <div className="mt-2 w-full max-h-32 overflow-y-auto rounded-md bg-destructive/10 border border-destructive/20 p-2 relative group">
                                <p className="text-[10px] text-destructive font-mono whitespace-pre-wrap break-all leading-tight pr-6">
                                  {item.errorMsg}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => navigator.clipboard.writeText(item.errorMsg!)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-sm p-1 text-muted-foreground hover:text-foreground shadow-sm"
                                  title="Copy Error Stack Trace"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                </button>
                              </div>
                            )}
                            {item.status === "done" && item.result && (
                              <p className="text-[10px] text-emerald-400 font-medium">
                                ✓ Saved to {item.result.outputDir?.split("\\").pop() ?? "output"}
                              </p>
                            )}
                          </div>
                        </div>

                        {(item.status === "pending" || item.status === "error") && (
                          <button
                            type="button"
                            onClick={() => store.removeBatchQueueItem(item.id)}
                            className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {!hasItems && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center border border-dashed border-border/50 rounded-xl">
              <List className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No items in queue. Add URLs from the URL Library.</p>
            </div>
          )}
        </div>
      </FramePanel>
    </Frame>
  );
}
