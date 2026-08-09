import { useState, useMemo } from "react";
import { Database, Play, Plus, Search, Check, Trash2, CheckCircle2, Clock, RotateCcw, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  
  const [urlSearchQuery, setUrlSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">("all");
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [newUrlTitle, setNewUrlTitle] = useState("");
  const [newUrlCategory, setNewUrlCategory] = useState("Tools");

  // Create a normalized set of generated output URLs
  const processedUrlSet = useMemo(() => {
    return new Set((store.usedUrls || []).map((u) => normalizeUrl(u)));
  }, [store.usedUrls]);

  const isUrlProcessed = (url: string) => {
    return processedUrlSet.has(normalizeUrl(url));
  };

  // Status counters
  const totalCount = store.savedUrls.length;
  const doneCount = useMemo(() => {
    return store.savedUrls.filter((item) => isUrlProcessed(item.url)).length;
  }, [store.savedUrls, processedUrlSet]);
  const pendingCount = totalCount - doneCount;

  const filteredUrls = store.savedUrls.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(urlSearchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === "All" || item.category === selectedCategoryFilter;
    
    const processed = isUrlProcessed(item.url);
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
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredUrls.map((u) => u.id));
      store.setSelectedSavedUrlIds(store.selectedSavedUrlIds.filter((id) => !filteredIds.has(id)));
    } else {
      const newSelected = new Set([...store.selectedSavedUrlIds, ...filteredUrls.map((u) => u.id)]);
      store.setSelectedSavedUrlIds(Array.from(newSelected));
    }
  };

  const handleRunSelectedUrls = () => {
    const selected = store.savedUrls
      .filter((item) => store.selectedSavedUrlIds.includes(item.id))
      .map((item) => item.url);
    if (selected.length > 0) {
      store.setUrls(selected.join("\n"));
      store.setActiveTab("studio");
    }
  };

  const handleRemoveSelected = async () => {
    if (store.selectedSavedUrlIds.length === 0) return;
    await store.removeSavedUrls(store.selectedSavedUrlIds);
  };

  const handleSyncStore = async () => {
    setIsSyncing(true);
    await store.fetchData();
    setIsSyncing(false);
  };

  const handleAddUrlToLibrary = async () => {
    if (!newUrlInput.trim()) return;
    const sanitized = sanitizeUrls(newUrlInput);
    if (!sanitized) return;

    const newItems: any[] = [];
    const urls = sanitized.split("\n").map(u => u.trim()).filter(Boolean);

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
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Quick Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> Saved URL Database
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20">
              {totalCount} total
            </Badge>
            {doneCount > 0 && (
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                {doneCount} outputted
              </Badge>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            File-backed URL library synced with output results in <code className="text-primary font-mono">data/url_library.json</code>.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncStore}
            disabled={isSyncing}
            className="text-xs gap-1.5 font-medium border-border hover:bg-muted w-full sm:w-auto"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} /> Sync Library & Outputs
          </Button>

          {store.selectedSavedUrlIds.length > 0 && (
            <>
              <Button
                onClick={handleRunSelectedUrls}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold w-full sm:w-auto"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Run ({store.selectedSavedUrlIds.length}) in Studio
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveSelected}
                className="text-xs gap-1.5 font-semibold w-full sm:w-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove ({store.selectedSavedUrlIds.length})
              </Button>
            </>
          )}

          <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
            <DialogTrigger
              render={
                <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1.5 font-semibold w-full sm:w-auto">
                  <Plus className="w-4 h-4" /> Add Saved URLs
                </Button>
              }
            />
            <DialogContent className="bg-card border-border text-foreground p-0 overflow-hidden sm:max-w-lg">
              <Frame variant="default" spacing="default">
                <FramePanel className="gap-4 p-5">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" /> Add URLs to Saved Library
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Paste single or multiple URLs below. The system automatically sanitizes parameters.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-3 py-1">
                    <div>
                      <label className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">
                        Webpage URLs (Bulk Paste Supported)
                      </label>
                      <Textarea
                        rows={5}
                        placeholder={"https://framer.com\nhttps://linear.app"}
                        value={newUrlInput}
                        onChange={(e) => setNewUrlInput(e.target.value)}
                        className="font-mono text-xs bg-muted/20 border-border"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">
                          Custom Title (Optional)
                        </label>
                        <Input
                          placeholder="Auto-derived if blank"
                          value={newUrlTitle}
                          onChange={(e) => setNewUrlTitle(e.target.value)}
                          className="bg-muted/20 border-border text-base sm:text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">Category</label>
                        <Select value={newUrlCategory} onValueChange={(val) => { if (val) setNewUrlCategory(val); }}>
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
                  <DialogFooter className="pt-2 border-t border-border/40">
                    <Button
                      onClick={handleAddUrlToLibrary}
                      disabled={!newUrlInput.trim()}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
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

      {/* Filter & Selection Control Bar */}
      <Frame variant="default" spacing="default">
        <FramePanel className="flex flex-col gap-4 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by title, URL, or category..."
                value={urlSearchQuery}
                onChange={(e) => setUrlSearchQuery(e.target.value)}
                className="pl-9 text-base sm:text-xs bg-muted/40 border-border"
              />
            </div>

            {/* Select All & Deselect All Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSelectAll}
                className="text-xs h-8 px-3 gap-1.5 border-border hover:bg-muted font-medium cursor-pointer active:scale-[0.97]"
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
                  onClick={() => store.setSelectedSavedUrlIds([])}
                  className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97]"
                >
                  Clear ({store.selectedSavedUrlIds.length})
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/40 pt-3">
            {/* Status Filter Tabs (All / Output Generated / Not Processed) */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 shrink-0 overflow-x-auto max-w-full">
              <Button
                variant={statusFilter === "all" ? "default" : "ghost"}
                size="xs"
                onClick={() => setStatusFilter("all")}
                className="text-xs font-semibold h-7 px-3 rounded-lg"
              >
                All ({totalCount})
              </Button>
              <Button
                variant={statusFilter === "done" ? "default" : "ghost"}
                size="xs"
                onClick={() => setStatusFilter("done")}
                className={`text-xs font-semibold h-7 px-3 rounded-lg gap-1.5 ${
                  statusFilter === "done" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Output Generated ({doneCount})
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "ghost"}
                size="xs"
                onClick={() => setStatusFilter("pending")}
                className="text-xs font-semibold h-7 px-3 rounded-lg gap-1.5"
              >
                <Clock className="w-3 h-3 text-muted-foreground" /> Not Processed ({pendingCount})
              </Button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from(new Set(["All", ...store.savedUrls.map((u) => u.category || "General")])).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategoryFilter === cat ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`text-xs h-7 px-3 rounded-full transition-all ${
                    selectedCategoryFilter === cat
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </FramePanel>
      </Frame>

      {/* URL Cards Grid */}
      {filteredUrls.length === 0 ? (
        <Frame variant="default" spacing="default">
          <FramePanel className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <Database className="w-8 h-8 text-muted-foreground opacity-50" />
            <p className="text-sm font-semibold text-muted-foreground">No matching URLs found.</p>
          </FramePanel>
        </Frame>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUrls.map((item) => {
            const isChecked = store.selectedSavedUrlIds.includes(item.id);
            const isProcessed = isUrlProcessed(item.url);

            return (
              <Frame
                key={item.id}
                variant="default"
                spacing="default"
                className={`cursor-pointer transition-all duration-200 ${
                  isChecked ? "border-primary bg-primary/10" : "hover:border-primary/50"
                }`}
                onClick={() => {
                  if (isChecked) {
                    store.setSelectedSavedUrlIds(store.selectedSavedUrlIds.filter((id) => id !== item.id));
                  } else {
                    store.setSelectedSavedUrlIds([...store.selectedSavedUrlIds, item.id]);
                  }
                }}
              >
                <FramePanel className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-foreground truncate">{item.title}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        isChecked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border/80 bg-muted/20 hover:border-primary/60"
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs font-mono text-muted-foreground truncate">{item.url}</p>

                  {/* Output Status Badge */}
                  <div className="pt-1">
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

                  {/* Footer & Card Action Buttons */}
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/40">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">
                      {item.category}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const lines = store.urls.split("\n").map(u => u.trim()).filter(Boolean);
                          if (!lines.includes(item.url)) {
                             store.setUrls([...lines, item.url].join("\n"));
                          }
                          store.setActiveTab("studio");
                        }}
                        className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10 gap-1 font-semibold"
                      >
                        <Play className="w-3 h-3 fill-current" /> Stage in Studio
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          store.removeSavedUrls([item.id]);
                        }}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Remove from library"
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
