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
import { CapacityAllocationCard } from "@/components/capacity-allocation-card";

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

  const notPostedPct = totalBatches > 0 ? Math.round((notPostedCount / totalBatches) * 100) : 0;
  const scheduledPct = totalBatches > 0 ? Math.round((scheduledCount / totalBatches) * 100) : 0;
  const postedPct = totalBatches > 0 ? Math.round((postedCount / totalBatches) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-card via-card/90 to-primary/5 border border-border/80 shadow-md">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
              Outputs Gallery &amp; Scheduler
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Manage generated carousel batches, update publication statuses, and schedule posts.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              playClick();
              window.location.href = "/api/outputs/download?folder=all";
            }}
            className="gap-1.5 text-xs font-bold h-9 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.97] transition-all shrink-0 shadow-sm"
            title="Download all generated slide batches as a ZIP archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download All (.ZIP)</span>
            <span className="sm:hidden">ZIP</span>
          </Button>
        </div>
      </div>

      {/* 3 KPI Capacity Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 w-full">
        {/* KPI 1: Not Posted */}
        <div
          onClick={() => {
            playClick();
            setStatusFilter(statusFilter === "not_posted" ? "all" : "not_posted");
          }}
          className="cursor-pointer h-full"
        >
          <CapacityAllocationCard
            title="Not Posted"
            percentage={notPostedPct}
            trend={notPostedCount > 0 ? `${notPostedCount} unposted` : "0 pending"}
            subtext="Drafts awaiting publication"
            footerLabel="Not Posted Count"
            footerValue={`${notPostedCount} / ${totalBatches}`}
            hideMembers={true}
            barColorClass="bg-amber-500"
            loading={loading}
            isSelected={statusFilter === "not_posted"}
            activeColorClass="ring-amber-500 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          />
        </div>

        {/* KPI 2: Scheduled */}
        <div
          onClick={() => {
            playClick();
            setStatusFilter(statusFilter === "scheduled" ? "all" : "scheduled");
          }}
          className="cursor-pointer h-full"
        >
          <CapacityAllocationCard
            title="Scheduled"
            percentage={scheduledPct}
            trend={scheduledCount > 0 ? `${scheduledCount} scheduled` : "0 queued"}
            subtext="Queued for automated release"
            footerLabel="Scheduled Count"
            footerValue={`${scheduledCount} / ${totalBatches}`}
            hideMembers={true}
            barColorClass="bg-blue-500"
            loading={loading}
            isSelected={statusFilter === "scheduled"}
            activeColorClass="ring-blue-500 border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
          />
        </div>

        {/* KPI 3: Posted */}
        <div
          onClick={() => {
            playClick();
            setStatusFilter(statusFilter === "posted" ? "all" : "posted");
          }}
          className="cursor-pointer h-full"
        >
          <CapacityAllocationCard
            title="Posted Outputs"
            percentage={postedPct}
            trend={postedCount > 0 ? `${postedCount} posted` : "0 posted"}
            subtext={`Posted to ${postedCount} output destination${postedCount === 1 ? "" : "s"}`}
            footerLabel="Posted Count"
            footerValue={`${postedCount} / ${totalBatches}`}
            hideMembers={true}
            barColorClass="bg-emerald-500"
            loading={loading}
            isSelected={statusFilter === "posted"}
            activeColorClass="ring-emerald-500 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
          />
        </div>
      </div>

      {/* Control Bar - All elements standardized to h-8 (32px) height */}
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

        {/* Status Filter Pills – h-8 height, auto width, not stretched */}
        <div className="flex items-center h-8 gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
          <button
            onClick={() => { playClick(); setStatusFilter("all"); }}
            className={`flex-none h-full text-xs font-semibold px-3 rounded-md transition-all flex items-center justify-center cursor-pointer ${
              statusFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalBatches})
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter("not_posted"); }}
            className={`flex-none h-full text-xs font-semibold px-3 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === "not_posted" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Circle className="w-3 h-3 opacity-60" /> Not Posted ({notPostedCount})
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter("posted"); }}
            className={`flex-none h-full text-xs font-semibold px-3 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === "posted" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Posted ({postedCount})
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter("scheduled"); }}
            className={`flex-none h-full text-xs font-semibold px-3 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === "scheduled" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3 h-3" /> Scheduled ({scheduledCount})
          </button>
        </div>

        {/* Spacer pushes sort+views to the right */}
        <div className="flex-1" />

        {/* Sort Dropdown - h-8 height */}
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 inline-flex items-center justify-center rounded-md border border-border/80 bg-background hover:bg-muted text-foreground h-8 px-3 text-xs font-medium gap-1.5 cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="capitalize">{sortBy}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("slides")}>Most Slides</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("title")}>Alphabetical</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Icons - h-8 height container */}
        <div className="flex items-center h-8 gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon-xs" onClick={() => { playClick(); setViewMode("grid"); }} title="Grid View" className="h-full w-7">
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="icon-xs" onClick={() => { playClick(); setViewMode("table"); }} title="Table View" className="h-full w-7">
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button variant={viewMode === "calendar" ? "secondary" : "ghost"} size="icon-xs" onClick={() => { playClick(); setViewMode("calendar"); }} title="Calendar View" className="h-full w-7">
            <CalendarIcon className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "grid" && (
        <OutputsGridView
          items={filteredOutputs}
          loading={loading}
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
