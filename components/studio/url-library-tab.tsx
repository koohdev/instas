"use client";

import { useState, useMemo } from "react";
import {
  Database,
  Play,
  Plus,
  Search,
  Check,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  CheckSquare,
  Square,
  ExternalLink,
  Copy,
  Layers,
  Sparkles,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useAppStore } from "@/lib/store";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sanitizeUrls } from "@/utils/url-sanitizer";

function normalizeUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

export function UrlLibraryTab() {
  const store = useAppStore();
  const { playClick } = useSoundEffects();

  const [urlSearchQuery, setUrlSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">("all");
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // New URL Dialog Inputs
  const [newUrlInput, setNewUrlInput] = useState("");
  const [newUrlTitle, setNewUrlTitle] = useState("");
  const [newUrlCategory, setNewUrlCategory] = useState("Tools");

  // Normalized set of generated output URLs
  const processedUrlSet = useMemo(() => {
    return new Set((store.usedUrls || []).map((u) => normalizeUrl(u)));
  }, [store.usedUrls]);

  const isUrlProcessed = (item: { url: string; status?: "pending" | "processed" }) => {
    return item.status === "processed" || processedUrlSet.has(normalizeUrl(item.url));
  };

  // Status counters
  const totalCount = store.savedUrls.length;
  const doneCount = useMemo(() => {
    return store.savedUrls.filter((item) => isUrlProcessed(item)).length;
  }, [store.savedUrls, processedUrlSet]);
  const pendingCount = totalCount - doneCount;

  const filteredUrls = store.savedUrls.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(urlSearchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === "All" || item.category === selectedCategoryFilter;

    const processed = isUrlProcessed(item);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "done" && processed) ||
      (statusFilter === "pending" && !processed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const allFilteredSelected =
    filteredUrls.length > 0 &&
    filteredUrls.every((item) => store.selectedSavedUrlIds.includes(item.id));

  const handleToggleSelectAll = () => {
    playClick();
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredUrls.map((u) => u.id));
      store.setSelectedSavedUrlIds(store.selectedSavedUrlIds.filter((id) => !filteredIds.has(id)));
    } else {
      const newSelected = new Set([...store.selectedSavedUrlIds, ...filteredUrls.map((u) => u.id)]);
      store.setSelectedSavedUrlIds(Array.from(newSelected));
    }
  };

  const handleRunSelectedUrls = () => {
    playClick();
    const selected = store.savedUrls
      .filter((item) => store.selectedSavedUrlIds.includes(item.id))
      .map((item) => item.url);
    if (selected.length > 0) {
      store.setUrls(selected.join("\n"));
      store.setActiveTab("studio");
    }
  };

  const handleRemoveSelected = async () => {
    playClick();
    if (store.selectedSavedUrlIds.length === 0) return;
    await store.removeSavedUrls(store.selectedSavedUrlIds);
  };

  const handleAddToBatchQueue = () => {
    playClick();
    const selected = store.savedUrls
      .filter((item) => store.selectedSavedUrlIds.includes(item.id))
      .map((item) => item.url);
    if (selected.length > 0) {
      store.enqueueBatch(selected, `Batch ${new Date().toLocaleTimeString()}`);
      store.setSelectedSavedUrlIds([]);
    }
  };

  const handleAddUrlToLibrary = async () => {
    playClick();
    if (!newUrlInput.trim()) return;
    const sanitized = sanitizeUrls(newUrlInput);
    if (!sanitized) return;

    const newItems: any[] = [];
    const urls = sanitized.split("\n").map((u) => u.trim()).filter(Boolean);

    for (const cleanUrl of urls) {
      try {
        const uObj = new URL(cleanUrl);
        const hostName = uObj.hostname.replace(/^www\./, "");
        const derivedTitle = newUrlTitle.trim() || hostName.charAt(0).toUpperCase() + hostName.slice(1);
        newItems.push({
          id: `url_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          url: cleanUrl,
          title: derivedTitle,
          category: newUrlCategory.trim() || "General",
          tags: [newUrlCategory.trim() || "General"],
          createdAt: new Date().toISOString(),
        });
      } catch {
        // skip invalid
      }
    }

    if (newItems.length > 0) {
      await store.addSavedUrls(newItems);
    }

    setIsUrlDialogOpen(false);
    setNewUrlInput("");
    setNewUrlTitle("");
    setNewUrlCategory("Tools");
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200 pb-12">
      {/* Hero Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-card via-card/90 to-primary/5 border border-border/80 shadow-md">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground leading-tight">
                Saved URL Database &amp; Scraper Queue
              </h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold">
                {totalCount} Saved
              </Badge>
              {doneCount > 0 && (
                <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono font-semibold">
                  {doneCount} Outputted
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              File-backed URL library synced with output generator results in <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded border border-primary/20">data/url_library.json</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {store.selectedSavedUrlIds.length > 0 && (
            <>
              <Button
                onClick={handleAddToBatchQueue}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-bold h-9 px-3.5 shrink-0 cursor-pointer active:scale-[0.97] shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" /> Queue ({store.selectedSavedUrlIds.length})
              </Button>

              <Button
                onClick={handleRunSelectedUrls}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 font-bold h-9 px-3.5 shrink-0 cursor-pointer active:scale-[0.97] shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Run ({store.selectedSavedUrlIds.length}) in Studio
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveSelected}
                className="text-xs gap-1.5 font-semibold h-9 px-3 shrink-0 cursor-pointer active:scale-[0.97]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove ({store.selectedSavedUrlIds.length})
              </Button>
            </>
          )}

          <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  onClick={() => playClick()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-bold h-9 px-4 cursor-pointer active:scale-[0.97] shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Saved URLs
                </Button>
              }
            />
            <DialogContent className="bg-card border-border text-foreground p-0 overflow-hidden sm:max-w-lg rounded-2xl shadow-2xl">
              <Frame variant="default" spacing="default">
                <FramePanel className="gap-4 p-5">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" /> Add URLs to Saved Library
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Paste single or multiple web URLs below. The system automatically sanitizes tracking parameters.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-3.5 py-1">
                    <div>
                      <label className="text-[11px] uppercase font-bold text-muted-foreground block mb-1.5 tracking-wider">
                        Webpage URLs (Bulk Paste Supported)
                      </label>
                      <Textarea
                        rows={5}
                        placeholder={"https://framer.com\nhttps://linear.app\nhttps://reactbits.dev"}
                        value={newUrlInput}
                        onChange={(e) => setNewUrlInput(e.target.value)}
                        className="font-mono text-xs bg-muted/20 border-border rounded-xl focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] uppercase font-bold text-muted-foreground block mb-1.5 tracking-wider">
                          Custom Title (Optional)
                        </label>
                        <Input
                          placeholder="Auto-derived if blank"
                          value={newUrlTitle}
                          onChange={(e) => setNewUrlTitle(e.target.value)}
                          className="bg-muted/20 border-border text-xs h-9"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-muted-foreground block mb-1.5 tracking-wider">
                          Category
                        </label>
                        <Select
                          value={newUrlCategory}
                          onValueChange={(val) => {
                            if (val) setNewUrlCategory(val);
                          }}
                        >
                          <SelectTrigger className="w-full h-9 text-xs bg-muted/20 border-border">
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="UI Components">UI Components</SelectItem>
                              <SelectItem value="Design Tools">Design Tools</SelectItem>
                              <SelectItem value="Productivity">Productivity</SelectItem>
                              <SelectItem value="Resources">Resources</SelectItem>
                              <SelectItem value="Tools">Tools</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-3 border-t border-border/40">
                    <Button
                      onClick={handleAddUrlToLibrary}
                      disabled={!newUrlInput.trim()}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 px-5 cursor-pointer shadow-sm"
                    >
                      Save URLs to Library
                    </Button>
                  </DialogFooter>
                </FramePanel>
              </Frame>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Control Bar: Search, Status Filters, Category Pills, & Selection Controls */}
      <Frame variant="default" spacing="default" className="w-full">
        <FramePanel className="p-3 gap-3">
          {/* Search Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by title, URL, domain, or category..."
                value={urlSearchQuery}
                onChange={(e) => setUrlSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 bg-background/80 w-full"
              />
            </div>

            {/* Select All & Selection Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSelectAll}
                className="text-xs h-8 px-3 gap-1.5 border-border hover:bg-muted font-semibold cursor-pointer active:scale-[0.97]"
              >
                {allFilteredSelected ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-primary" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-muted-foreground" /> Select All ({filteredUrls.length})
                  </>
                )}
              </Button>

              {store.selectedSavedUrlIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    playClick();
                    store.setSelectedSavedUrlIds([]);
                  }}
                  className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97]"
                >
                  Clear Selection ({store.selectedSavedUrlIds.length})
                </Button>
              )}
            </div>
          </div>

          {/* Filters Row: Status Pills & Category Tabs - Standardized to h-8 height */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border/40 w-full">
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
                All ({totalCount})
              </button>

              <button
                onClick={() => {
                  playClick();
                  setStatusFilter("done");
                }}
                className={`h-full flex-none text-xs font-semibold px-3 rounded-md transition-all inline-flex items-center justify-center gap-1 cursor-pointer ${
                  statusFilter === "done"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Output Generated ({doneCount})
              </button>

              <button
                onClick={() => {
                  playClick();
                  setStatusFilter("pending");
                }}
                className={`h-full flex-none text-xs font-semibold px-3 rounded-md transition-all inline-flex items-center justify-center gap-1 cursor-pointer ${
                  statusFilter === "pending"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="w-3 h-3 opacity-60" /> Not Processed ({pendingCount})
              </button>
            </div>

            {/* Category Filter Pills - h-8 height */}
            <div className="flex items-center gap-1 flex-wrap">
              {Array.from(new Set(["All", ...store.savedUrls.map((u) => u.category || "General")])).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playClick();
                    setSelectedCategoryFilter(cat);
                  }}
                  className={`h-8 text-[11px] font-semibold px-3 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 border border-border/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </FramePanel>
      </Frame>

      {/* URL Cards Grid */}
      {filteredUrls.length === 0 ? (
        <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center bg-card/40">
          <Globe className="w-10 h-10 text-muted-foreground/40" />
          <h5 className="text-sm font-bold text-foreground">No Matching Saved URLs Found</h5>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query or category filters above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {filteredUrls.map((item) => {
            const isChecked = store.selectedSavedUrlIds.includes(item.id);
            const isProcessed = isUrlProcessed(item);

            return (
              <Frame
                key={item.id}
                variant="default"
                spacing="default"
                className={`group transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isChecked
                    ? "ring-2 ring-inset ring-primary border-primary bg-primary/5 shadow-md"
                    : "hover:border-border/90 hover:shadow-md"
                }`}
                onClick={() => {
                  playClick();
                  if (isChecked) {
                    store.setSelectedSavedUrlIds(store.selectedSavedUrlIds.filter((id) => id !== item.id));
                  } else {
                    store.setSelectedSavedUrlIds([...store.selectedSavedUrlIds, item.id]);
                  }
                }}
              >
                <FramePanel className="p-4 flex flex-col gap-3 justify-between h-full">
                  <div className="flex flex-col gap-2">
                    {/* Header Row: Title & Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {(() => {
                          try {
                            const domain = new URL(item.url).hostname;
                            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                            return (
                              <img
                                src={faviconUrl}
                                alt=""
                                className="w-4 h-4 rounded shrink-0 object-contain"
                                onError={(e) => {
                                  // Hide broken favicon image and show fallback Globe icon
                                  (e.target as HTMLElement).style.display = "none";
                                  const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "inline-block";
                                }}
                              />
                            );
                          } catch {
                            return null;
                          }
                        })()}
                        <Globe className="w-4 h-4 text-primary/70 shrink-0 hidden" />
                        <span className="font-bold text-sm text-foreground truncate">{item.title}</span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground shadow-xs"
                            : "border-border/80 bg-muted/20 hover:border-primary/60"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* URL Link snippet */}
                    <p className="text-[11px] font-mono text-muted-foreground truncate bg-muted/30 px-2 py-1 rounded border border-border/40">
                      {item.url}
                    </p>

                    {/* Output Status Badge */}
                    <div className="pt-0.5">
                      {isProcessed ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] gap-1 font-semibold py-0.5 px-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Output Generated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground/70 border-border/60 text-[10px] gap-1 py-0.5 px-2">
                          <Clock className="w-3 h-3 text-muted-foreground/50" /> Not Processed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Card Footer & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-medium">
                      {item.category || "General"}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          navigator.clipboard.writeText(item.url);
                          setCopiedUrlId(item.id);
                          setTimeout(() => setCopiedUrlId(null), 2000);
                        }}
                        className="size-6 text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97]"
                        title="Copy URL"
                      >
                        {copiedUrlId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          window.open(item.url, "_blank");
                        }}
                        className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97]"
                        title="Open URL in New Tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          const lines = store.urls.split("\n").map((u) => u.trim()).filter(Boolean);
                          if (!lines.includes(item.url)) {
                            store.setUrls([...lines, item.url].join("\n"));
                          }
                          store.setActiveTab("studio");
                        }}
                        className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10 gap-1 font-bold cursor-pointer active:scale-[0.97]"
                        title="Stage URL in Studio Configurator"
                      >
                        <Play className="w-3 h-3 fill-current" /> Stage
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          store.removeSavedUrls([item.id]);
                        }}
                        className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer active:scale-[0.97]"
                        title="Remove from Library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </FramePanel>
              </Frame>
            );
          })}
        </div>
      )}
    </div>
  );
}
