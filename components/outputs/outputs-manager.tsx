"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Circle,
  FolderCheck,
  RefreshCw,
  Sparkles,
  Layers,
  Download,
} from "lucide-react";
import { OutputsGridView } from "./outputs-grid-view";
import { OutputsTableView } from "./outputs-table-view";
import { OutputsCalendarView } from "./outputs-calendar-view";
import { OutputSlideDrawer } from "./output-slide-drawer";
import type { OutputBatchItem } from "@/app/api/outputs/route";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function OutputsManager() {
  const [outputs, setOutputs] = useState<OutputBatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "calendar">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "posted" | "not_posted" | "scheduled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "slides" | "title">("newest");
  const [selectedBatch, setSelectedBatch] = useState<OutputBatchItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { playClick } = useSoundEffects();

  const fetchOutputs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outputs");
      if (res.ok) {
        const data = await res.json();
        if (data.outputs) setOutputs(data.outputs);
      }
    } catch (err) {
      console.error("Failed to fetch outputs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutputs();
  }, []);

  const handleUpdateStatus = async (
    folderName: string,
    status: "not_posted" | "posted" | "scheduled",
    scheduledDate?: string
  ) => {
    // Optimistic state update
    setOutputs((prev) =>
      prev.map((item) =>
        item.folderName === folderName
          ? { ...item, status, scheduledDate: scheduledDate || item.scheduledDate }
          : item
      )
    );

    if (selectedBatch && selectedBatch.folderName === folderName) {
      setSelectedBatch((prev) => (prev ? { ...prev, status, scheduledDate: scheduledDate || prev.scheduledDate } : null));
    }

    try {
      await fetch("/api/outputs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName, status, scheduledDate }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    // Optimistic state update
    setOutputs((prev) => prev.filter((item) => item.folderName !== folderName));

    try {
      await fetch(`/api/outputs?folderName=${encodeURIComponent(folderName)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete output folder:", err);
    }
  };

  // Filter & Sort Logic
  const filteredOutputs = outputs
    .filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.folderName.toLowerCase().includes(q) ||
          (item.category && item.category.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "slides") return b.slideCount - a.slideCount;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  // Calculate Summary Stats
  const totalBatches = outputs.length;
  const postedCount = outputs.filter((o) => o.status === "posted").length;
  const notPostedCount = outputs.filter((o) => o.status === "not_posted").length;
  const scheduledCount = outputs.filter((o) => o.status === "scheduled").length;
  const totalSlides = outputs.reduce((acc, o) => acc + o.slideCount, 0);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Header & Stats Banner */}
      <div className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-card via-card/90 to-primary/5 border border-border/80 shadow-md">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">Outputs Gallery &amp; Scheduler</h2>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Manage all generated carousels, update publication status, and schedule upcoming posts.
            </p>
          </div>
        </div>

        {/* Right: Stats + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Inline stats pill – desktop only */}
          <div className="hidden md:flex items-center divide-x divide-border/50 bg-muted/40 rounded-xl border border-border/50 text-xs overflow-hidden">
            <div className="flex flex-col items-center px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Total</span>
              <span className="font-bold text-foreground font-mono">{totalBatches}</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1.5">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide">Posted</span>
              <span className="font-bold text-emerald-400 font-mono">{postedCount}</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1.5">
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">Scheduled</span>
              <span className="font-bold text-blue-400 font-mono">{scheduledCount}</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Slides</span>
              <span className="font-bold text-foreground font-mono">{totalSlides}</span>
            </div>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => { playClick(); window.location.href = "/api/outputs/download?folder=all"; }}
            className="gap-1.5 text-xs font-bold h-9 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.97] transition-all shrink-0"
            title="Download all generated slide batches as a ZIP archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download All (.ZIP)</span>
            <span className="sm:hidden">ZIP</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { playClick(); fetchOutputs(); }}
            disabled={loading}
            className="gap-1.5 text-xs font-semibold h-9 cursor-pointer active:scale-[0.97] shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-2 bg-card p-2.5 rounded-xl border border-border/70 shadow-xs">
        {/* Search */}
        <div className="relative shrink-0 w-44 lg:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outputs..."
            className="pl-8 h-8 text-xs bg-background/80 w-full"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border/50 shrink-0" />

        {/* Status Filter Pills – evenly fill the remaining space */}
        <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50 flex-1 min-w-0">
          <button
            onClick={() => { playClick(); setStatusFilter("all"); }}
            className={`flex-1 text-xs font-semibold px-2 py-1 rounded-md transition-all cursor-pointer text-center ${
              statusFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalBatches})
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter("not_posted"); }}
            className={`flex-1 text-xs font-semibold px-2 py-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === "not_posted" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Circle className="w-3 h-3 opacity-60 shrink-0" />
            <span>Not Posted ({notPostedCount})</span>
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter("posted"); }}
            className={`flex-1 text-xs font-semibold px-2 py-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === "posted" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Posted ({postedCount})</span>
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter("scheduled"); }}
            className={`flex-1 text-xs font-semibold px-2 py-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === "scheduled" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3 h-3 shrink-0" />
            <span>Scheduled ({scheduledCount})</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border/50 shrink-0" />

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 inline-flex items-center justify-center rounded-md border border-border/80 bg-background hover:bg-muted text-foreground h-8 px-3 text-xs font-medium gap-1.5 cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="capitalize hidden sm:inline">{sortBy}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("slides")}>Most Slides</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("title")}>Alphabetical</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Icons */}
        <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon-xs" onClick={() => { playClick(); setViewMode("grid"); }} title="Grid View" className="size-7">
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="icon-xs" onClick={() => { playClick(); setViewMode("table"); }} title="Table View" className="size-7">
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button variant={viewMode === "calendar" ? "secondary" : "ghost"} size="icon-xs" onClick={() => { playClick(); setViewMode("calendar"); }} title="Calendar View" className="size-7">
            <CalendarIcon className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "grid" && (
        <OutputsGridView
          items={filteredOutputs}
          onSelectBatch={(item) => {
            playClick();
            setSelectedBatch(item);
            setDrawerOpen(true);
          }}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteFolder}
        />
      )}

      {viewMode === "table" && (
        <OutputsTableView
          items={filteredOutputs}
          onSelectBatch={(item) => {
            playClick();
            setSelectedBatch(item);
            setDrawerOpen(true);
          }}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteFolder}
        />
      )}

      {viewMode === "calendar" && (
        <OutputsCalendarView
          items={filteredOutputs}
          onSelectBatch={(item) => {
            playClick();
            setSelectedBatch(item);
            setDrawerOpen(true);
          }}
        />
      )}

      {/* Slide Inspector Drawer */}
      <OutputSlideDrawer
        item={selectedBatch}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteFolder}
      />
    </div>
  );
}
