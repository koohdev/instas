"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowRight, CheckCheck, Clock, Calendar, MoveHorizontal, FolderPlus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface ActiveCarouselBatchesProps {
  onNavigateTab?: (tab: string) => void;
}

interface OutputBatchApiItem {
  folderName: string;
  title: string;
  createdAt: string;
  status: "not_posted" | "posted" | "scheduled";
  scheduledDate?: string;
  notes?: string;
  category?: string;
  slideCount: number;
  slides: string[];
}

export function ActiveCarouselBatches({ onNavigateTab }: ActiveCarouselBatchesProps) {
  const store = useAppStore();
  const { playClick } = useSoundEffects();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Kinetic momentum dragging state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Real output batches fetched from /api/outputs
  const [realOutputs, setRealOutputs] = useState<OutputBatchApiItem[]>([]);
  const [, setIsLoadingOutputs] = useState(true);

  // Fetch real outputs from server API
  useEffect(() => {
    let isMounted = true;
    async function fetchRealOutputs() {
      try {
        setIsLoadingOutputs(true);
        const res = await fetch("/api/outputs");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.outputs)) {
          setRealOutputs(data.outputs);
        }
      } catch (err) {
        console.error("Failed to fetch outputs from /api/outputs:", err);
      } finally {
        if (isMounted) setIsLoadingOutputs(false);
      }
    }

    fetchRealOutputs();
    return () => {
      isMounted = false;
    };
  }, [store.generationStatus]);

  const isGenerating = store.generationStatus === "loading";

  // Derive active carousel batches strictly from real fetched output items with theme-adaptive gradients
  const batches = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      status: string;
      date: string;
      tags: string[];
      statusLabel: string;
      statusColor: string;
      gradientClass: string;
    }> = [];

    // 1. Convert real API output items
    realOutputs.forEach((item, idx) => {
      const formattedDate = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Aug 10, 2026";

      let statusLabel = "Completed";
      let statusColor = "bg-amber-500/15 text-amber-700 dark:bg-[#F59E0B1F] dark:text-[#F59E0B]";
      let gradientClass = "bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(245,158,11,0.12)_100%)] dark:bg-[linear-gradient(180deg,#18181B_20%,rgba(245,158,11,0.20)_100%)]";

      if (item.status === "posted") {
        statusLabel = "Posted";
        statusColor = "bg-emerald-500/15 text-emerald-700 dark:bg-[#10B9811F] dark:text-[#10B981]";
        gradientClass = "bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(16,185,129,0.12)_100%)] dark:bg-[linear-gradient(180deg,#18181B_20%,rgba(16,185,129,0.20)_100%)]";
      } else if (item.status === "scheduled") {
        statusLabel = "Scheduled";
        statusColor = "bg-blue-500/15 text-blue-700 dark:bg-[#3B82F61F] dark:text-[#3B82F6]";
        gradientClass = "bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(59,130,246,0.12)_100%)] dark:bg-[linear-gradient(180deg,#18181B_20%,rgba(59,130,246,0.20)_100%)]";
      }

      items.push({
        id: `real-${item.folderName}-${idx}`,
        title: item.title || item.folderName,
        description: item.notes || `${item.slideCount} slide batch export ready for Instagram.`,
        status: item.status,
        date: formattedDate,
        tags: [item.category || "Carousel", `${item.slideCount} Slides`],
        statusLabel,
        statusColor,
        gradientClass,
      });
    });

    // 2. Prepend active rendering batch if currently generating
    if (isGenerating) {
      items.unshift({
        id: "rendering-active",
        title: store.batchName || (store.settings.coverTitle ? store.settings.coverTitle : "New Batch"),
        description: store.settings.coverSubtitle || "Generating carousel batch slides...",
        status: "rendering",
        date: "Just now",
        tags: ["Live Batch", "Generating"],
        statusLabel: "Rendering",
        statusColor: "bg-sky-500/15 text-sky-700 dark:bg-[#0EA5E91F] dark:text-[#38BDF8]",
        gradientClass: "bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(14,165,233,0.15)_100%)] dark:bg-[linear-gradient(180deg,#18181B_20%,rgba(14,165,233,0.22)_100%)]",
      });
    }

    return items;
  }, [realOutputs, isGenerating, store.batchName, store.settings.coverTitle, store.settings.coverSubtitle]);

  // Kinetic Inertial Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    setIsMouseDown(true);
    const startXVal = e.pageX - carouselRef.current.offsetLeft;
    setStartX(startXVal);
    setScrollLeftState(carouselRef.current.scrollLeft);
    lastXRef.current = e.pageX;
    velocityRef.current = 0;
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);

    // Apply smooth kinetic inertia decay loop
    const applyKineticDecay = () => {
      if (!carouselRef.current || Math.abs(velocityRef.current) < 0.2) return;
      carouselRef.current.scrollLeft -= velocityRef.current;
      velocityRef.current *= 0.92; // Friction factor
      animFrameIdRef.current = requestAnimationFrame(applyKineticDecay);
    };

    animFrameIdRef.current = requestAnimationFrame(applyKineticDecay);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeftState - walk;

    // Track instant velocity for kinetic inertia
    const deltaX = e.pageX - lastXRef.current;
    velocityRef.current = deltaX * 0.8;
    lastXRef.current = e.pageX;
  };

  return (
    <div className="flex flex-col w-full rounded-[9px] gap-3 p-4.5 bg-card text-card-foreground dark:bg-[#171717] border border-border dark:border-[#27272A] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-0.5 gap-1.5 w-full">
        <h3 className="font-extrabold text-[15px] text-foreground dark:text-[#FAFAFA] tracking-wide">
          Active Carousel Batches
        </h3>
        {batches.length > 0 && (
          <span className="text-[11px] text-muted-foreground dark:text-[#A1A1AA] flex items-center gap-1.5 font-medium select-none whitespace-nowrap">
            <MoveHorizontal className="w-3.5 h-3.5 text-muted-foreground dark:text-[#A1A1AA] shrink-0" />
            <span>Drag horizontally to browse history ({batches.length})</span>
          </span>
        )}
      </div>

      {/* Draggable & Scrollable Carousel Container */}
      {batches.length > 0 ? (
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onMouseMove={handleMouseMove}
          className={`w-full overflow-x-auto custom-scrollbar pb-2 pt-1 flex gap-4 select-none ${
            isMouseDown ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="flex flex-col justify-between w-[340px] shrink-0 rounded-2xl overflow-hidden bg-card dark:bg-[#18181B] border border-border dark:border-[#27272A] transition-all hover:border-border/80 dark:hover:border-[#3F3F46] hover:shadow-lg min-h-[210px]"
            >
              {/* Full height gradient container filling down to border */}
              <div
                className={`flex flex-col flex-1 p-4.5 gap-3 justify-between transition-all duration-300 ${batch.gradientClass}`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className={`flex items-center py-1 px-2.5 rounded-lg gap-1.5 ${batch.statusColor}`}>
                      {batch.status === "rendering" || batch.status === "completed" || batch.status === "posted" ? (
                        <CheckCheck className="w-3 h-3 stroke-[2.5]" />
                      ) : batch.status === "scheduled" ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <Calendar className="w-3 h-3" />
                      )}
                      <span className="font-semibold text-[11px]">{batch.statusLabel}</span>
                    </div>
                    <span className="text-muted-foreground dark:text-[#71717A] text-[11px] font-mono">{batch.date}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-foreground dark:text-white text-sm leading-snug truncate">{batch.title}</h4>
                    <p className="text-[12px] text-muted-foreground dark:text-[#A1A1AA] leading-relaxed line-clamp-2">
                      {batch.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {batch.tags.map((tag) => (
                    <span
                      key={tag}
                      className="py-0.5 px-2 rounded-md bg-muted dark:bg-[#27272A] border border-border dark:border-[#3F3F46] text-foreground dark:text-[#D1D5DB] text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onNavigateTab?.("outputs");
                }}
                className="flex justify-between items-center py-2.5 px-4 bg-muted/50 dark:bg-[#121215] border-t border-border dark:border-[#27272A] hover:bg-muted dark:hover:bg-[#1c1c22] cursor-pointer transition-colors text-left shrink-0"
              >
                <span className="font-semibold text-muted-foreground dark:text-[#A1A1AA] text-xs">View Output</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground dark:text-[#A1A1AA]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl bg-muted/20 dark:bg-[#18181B0B] border border-dashed border-border dark:border-[#27272A] gap-2">
          <FolderPlus className="w-6 h-6 text-muted-foreground dark:text-[#71717A]" />
          <p className="text-xs text-muted-foreground dark:text-[#A1A1AA] font-semibold">No active carousel batches generated yet.</p>
          <p className="text-[11px] text-muted-foreground/80 dark:text-[#71717A]">Click "Generate Carousel" to start your first batch!</p>
        </div>
      )}
    </div>
  );
}
