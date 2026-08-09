"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Link as LinkIcon,
  Palette,
  Type,
  ImageIcon,
  Tag,
  Rocket,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  Sparkles,
  Layers,
  RotateCcw,
  Eye,
  Sliders,
} from "lucide-react";
import { BackgroundSelectorModal } from "./background-selector-modal";
import { FontSelectorModal } from "./font-selector-modal";
import { GenerationPreview } from "./generation-preview";

interface NodePosition {
  x: number;
  y: number;
}

export function CanvasFlowEditor() {
  const store = useAppStore();

  // Canvas Viewport Ref for Non-Passive Wheel Interception
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas Pan & Zoom State (Hardware Accelerated)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Modal dialog states inside canvas
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Balanced 5-Column Spacious Layout with Live Preview Node embedded inside
  const initialNodes: Record<string, NodePosition> = {
    urls: { x: 40, y: 140 },
    theme: { x: 380, y: 40 },
    background: { x: 380, y: 350 },
    typography: { x: 720, y: 40 },
    branding: { x: 720, y: 350 },
    generator: { x: 1060, y: 180 },
    preview: { x: 1440, y: 40 },
  };

  const [nodes, setNodes] = useState<Record<string, NodePosition>>(initialNodes);

  // Active dragging node
  const [activeDraggingNode, setActiveDraggingNode] = useState<string | null>(null);
  const nodeDragOffsetRef = useRef({ x: 0, y: 0 });

  // Staged URLs calculation
  const urlList = store.urls.split("\n").map((u) => u.trim()).filter(Boolean);

  // Non-Passive Native Wheel Listener: Intercepts wheel scroll to prevent parent window scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.4), 2.2));
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  // Canvas Drag / Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeDraggingNode) return;
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (activeDraggingNode) {
        const newX = Math.max(0, (e.clientX - nodeDragOffsetRef.current.x) / zoom);
        const newY = Math.max(0, (e.clientY - nodeDragOffsetRef.current.y) / zoom);
        setNodes((prev) => ({
          ...prev,
          [activeDraggingNode]: { x: newX, y: newY },
        }));
        return;
      }

      if (isPanning) {
        setPan({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      }
    },
    [activeDraggingNode, isPanning, zoom]
  );

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setActiveDraggingNode(null);
  };

  const handleNodeHeaderMouseDown = (nodeKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDraggingNode(nodeKey);
    const nodePos = nodes[nodeKey];
    nodeDragOffsetRef.current = {
      x: e.clientX - nodePos.x * zoom,
      y: e.clientY - nodePos.y * zoom,
    };
  };

  const handleResetLayout = () => {
    setNodes(initialNodes);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Preset apply helper
  const handleSelectTemplate = (templateId: string | null) => {
    if (!templateId) return;
    const found = store.templates.find((t) => t.id === templateId);
    if (found) {
      store.applyTemplate(found);
      setSelectedTemplateId(templateId);
    }
  };

  // Port position calculation for orthogonal lines
  const getNodePortPos = (nodeKey: string, isOutput: boolean) => {
    const pos = nodes[nodeKey] || { x: 0, y: 0 };
    const width = nodeKey === "preview" ? 460 : nodeKey === "generator" ? 320 : 300;
    const height = nodeKey === "preview" ? 580 : 240;
    return {
      x: pos.x + (isOutput ? width : 0),
      y: pos.y + height / 2,
    };
  };

  // Crisp 90-Degree Orthogonal Connection Lines
  const renderOrthogonalConnection = (fromNode: string, toNode: string) => {
    const from = getNodePortPos(fromNode, true);
    const to = getNodePortPos(toNode, false);
    const midX = from.x + (to.x - from.x) / 2;

    const pathData = `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;

    return (
      <g key={`${fromNode}-${toNode}`}>
        {/* Glow outer line */}
        <path d={pathData} fill="none" stroke="var(--primary)" strokeWidth="4" strokeOpacity="0.15" className="blur-[1px]" />
        {/* Crisp orthogonal line */}
        <path d={pathData} fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="5 3" strokeOpacity="0.75" />
        {/* Connection Port Anchors */}
        <circle cx={from.x} cy={from.y} r="4.5" fill="var(--primary)" className="stroke-background stroke-2" />
        <circle cx={to.x} cy={to.y} r="4.5" fill="var(--primary)" className="stroke-background stroke-2" />
      </g>
    );
  };

  return (
    <div className="relative w-full flex-1 min-h-[500px] rounded-2xl border border-border bg-card overflow-hidden shadow-2xl select-none flex flex-col">
      {/* TOP CANVAS TOOLBAR CONTROLS */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-card/95 backdrop-blur-md p-1.5 rounded-xl border border-border/80 shadow-xl">
        <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 gap-1.5 px-2.5 py-1 text-xs font-bold">
          <Layers className="w-3.5 h-3.5 text-primary" /> Visual Automation Canvas
        </Badge>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleResetLayout}
          className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Reset Node Positions"
        >
          <RotateCcw className="w-3 h-3" /> Auto-Layout
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-card/95 backdrop-blur-md p-1.5 rounded-xl border border-border/80 shadow-xl">
        <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))} title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <span className="text-xs font-mono font-bold w-12 text-center text-foreground">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))} title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Fit View">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* MAIN HIGH-PERFORMANCE CANVAS VIEWPORT */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px]"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        <div
          className="absolute inset-0 origin-top-left will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* ORTHOGONAL STRAIGHT-SEGMENT CONNECTIONS */}
          <svg className="absolute inset-0 w-[4000px] h-[3000px] pointer-events-none z-0">
            {renderOrthogonalConnection("urls", "theme")}
            {renderOrthogonalConnection("urls", "background")}
            {renderOrthogonalConnection("theme", "typography")}
            {renderOrthogonalConnection("background", "branding")}
            {renderOrthogonalConnection("typography", "generator")}
            {renderOrthogonalConnection("branding", "generator")}
            {renderOrthogonalConnection("generator", "preview")}
          </svg>

          {/* ============================================================ */}
          {/* NODE 1: INPUT URLS SOURCE NODE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[300px] z-10 shadow-xl"
            style={{ left: `${nodes.urls.x}px`, top: `${nodes.urls.y}px` }}
          >
            <Frame variant="default" spacing="default" className="border border-border/80 hover:border-primary/50 transition-colors bg-card">
              <FramePanel className="p-0 overflow-hidden">
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown("urls", e)}
                  className="flex items-center justify-between p-3 bg-muted/40 border-b border-border/40 cursor-move"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <LinkIcon className="w-4 h-4 text-primary" /> 1. Webpage URLs
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                    {urlList.length} Staged
                  </Badge>
                </div>
                <div className="p-3.5 flex flex-col gap-3">
                  <Textarea
                    rows={4}
                    placeholder={"https://reactbits.dev\nhttps://framer.com"}
                    value={store.urls}
                    onChange={(e) => store.setUrls(e.target.value)}
                    className="font-mono text-xs bg-muted/20 border-border h-24"
                  />
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                    <span>Source: Web Crawl</span>
                    <span className="text-primary font-bold">Port Out &rarr;</span>
                  </div>
                </div>
              </FramePanel>
            </Frame>
          </div>

          {/* ============================================================ */}
          {/* NODE 2: DESIGN TEMPLATE NODE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[300px] z-10 shadow-xl"
            style={{ left: `${nodes.theme.x}px`, top: `${nodes.theme.y}px` }}
          >
            <Frame variant="default" spacing="default" className="border border-border/80 hover:border-primary/50 transition-colors bg-card">
              <FramePanel className="p-0 overflow-hidden">
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown("theme", e)}
                  className="flex items-center justify-between p-3 bg-muted/40 border-b border-border/40 cursor-move"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Palette className="w-4 h-4 text-primary" /> 2. Visual Theme
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border">
                    Preset
                  </Badge>
                </div>
                <div className="p-3.5 flex flex-col gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Select Preset Template</Label>
                    <Select
                      value={selectedTemplateId}
                      onValueChange={handleSelectTemplate}
                    >
                      <SelectTrigger className="h-8 text-xs bg-muted/20 border-border">
                        <SelectValue placeholder="Choose template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {store.templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20 border border-border/40 text-[11px] flex items-center justify-between">
                    <span className="text-muted-foreground">Active Style:</span>
                    <span className="font-bold text-foreground capitalize">{store.settings.coverStyle}</span>
                  </div>
                </div>
              </FramePanel>
            </Frame>
          </div>

          {/* ============================================================ */}
          {/* NODE 3: CUSTOM BACKGROUND & EFFECTS NODE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[300px] z-10 shadow-xl"
            style={{ left: `${nodes.background.x}px`, top: `${nodes.background.y}px` }}
          >
            <Frame variant="default" spacing="default" className="border border-border/80 hover:border-primary/50 transition-colors bg-card">
              <FramePanel className="p-0 overflow-hidden">
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown("background", e)}
                  className="flex items-center justify-between p-3 bg-muted/40 border-b border-border/40 cursor-move"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <ImageIcon className="w-4 h-4 text-primary" /> 3. Background & Effects
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border">
                    Visuals
                  </Badge>
                </div>
                <div className="p-3.5 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBgModalOpen(true)}
                    className="justify-between text-xs h-9 border-border hover:bg-muted/40 cursor-pointer active:scale-[0.97]"
                  >
                    <span className="font-bold text-foreground truncate">
                      {store.settings.bgType === "custom" ? store.settings.customBgImage || "Custom Image" : "Default Gradient"}
                    </span>
                    <ImageIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                  </Button>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">Blurred Screenshot BG</span>
                    <Switch
                      checked={!!store.settings.showBlurredBg}
                      onCheckedChange={(val) => store.updateSetting("showBlurredBg", val)}
                    />
                  </div>
                </div>
              </FramePanel>
            </Frame>
          </div>

          {/* ============================================================ */}
          {/* NODE 4: TYPOGRAPHY & FONT FAMILY NODE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[300px] z-10 shadow-xl"
            style={{ left: `${nodes.typography.x}px`, top: `${nodes.typography.y}px` }}
          >
            <Frame variant="default" spacing="default" className="border border-border/80 hover:border-primary/50 transition-colors bg-card">
              <FramePanel className="p-0 overflow-hidden">
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown("typography", e)}
                  className="flex items-center justify-between p-3 bg-muted/40 border-b border-border/40 cursor-move"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Type className="w-4 h-4 text-primary" /> 4. Typography
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border">
                    Font Family
                  </Badge>
                </div>
                <div className="p-3.5 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFontModalOpen(true)}
                    className="justify-between text-xs h-9 border-border hover:bg-muted/40 cursor-pointer active:scale-[0.97]"
                  >
                    <span className="font-bold text-foreground truncate">{store.settings.fontFamily || "Inter"}</span>
                    <Type className="w-3.5 h-3.5 text-primary shrink-0" />
                  </Button>
                  <div className="py-2 px-3 rounded-lg bg-muted/20 border border-border/40 text-center">
                    <span
                      className="text-xs font-bold text-foreground truncate block"
                      style={{ fontFamily: `'${store.settings.fontFamily}', sans-serif` }}
                    >
                      Typography Specimen
                    </span>
                  </div>
                </div>
              </FramePanel>
            </Frame>
          </div>

          {/* ============================================================ */}
          {/* NODE 5: CORNER BRANDING & TAGS NODE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[300px] z-10 shadow-xl"
            style={{ left: `${nodes.branding.x}px`, top: `${nodes.branding.y}px` }}
          >
            <Frame variant="default" spacing="default" className="border border-border/80 hover:border-primary/50 transition-colors bg-card">
              <FramePanel className="p-0 overflow-hidden">
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown("branding", e)}
                  className="flex items-center justify-between p-3 bg-muted/40 border-b border-border/40 cursor-move"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Tag className="w-4 h-4 text-primary" /> 5. Corner Branding Tags
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border">
                    Tags
                  </Badge>
                </div>
                <div className="p-3.5 flex flex-col gap-3">
                  <div className="grid gap-1">
                    <Label className="text-[10px] text-muted-foreground">Top-Left Tag</Label>
                    <Input
                      className="h-8 text-xs font-mono bg-muted/20"
                      value={store.settings.topLeftText || ""}
                      onChange={(e) => store.updateSetting("topLeftText", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-[10px] text-muted-foreground">Bottom-Right Tag</Label>
                    <Input
                      className="h-8 text-xs font-mono bg-muted/20"
                      value={store.settings.bottomRightText || ""}
                      onChange={(e) => store.updateSetting("bottomRightText", e.target.value)}
                    />
                  </div>
                </div>
              </FramePanel>
            </Frame>
          </div>

          {/* ============================================================ */}
          {/* NODE 6: CAROUSEL BATCH OUTPUT GENERATOR NODE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[320px] z-10 shadow-2xl"
            style={{ left: `${nodes.generator.x}px`, top: `${nodes.generator.y}px` }}
          >
            <Frame variant="default" spacing="default" className="border-2 border-primary ring-4 ring-primary/20 bg-card">
              <FramePanel className="p-0 overflow-hidden">
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown("generator", e)}
                  className="flex items-center justify-between p-3 bg-primary/10 border-b border-primary/30 cursor-move"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Rocket className="w-4 h-4" /> 6. Output Generator Target
                  </div>
                  <Badge className="bg-primary text-primary-foreground font-extrabold text-[10px]">
                    Target
                  </Badge>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Output Folder Name</Label>
                    <Input
                      placeholder="e.g. Weekly-Design-Stack"
                      className="text-xs h-9 bg-muted/20"
                      value={store.batchName}
                      onChange={(e) => store.setBatchName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Aspect Ratio</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["4:5", "1:1", "9:16"] as const).map((ratio) => (
                        <Button
                          key={ratio}
                          variant={store.aspectRatio === ratio ? "default" : "outline"}
                          size="xs"
                          onClick={() => store.setAspectRatio(ratio)}
                          className="text-xs font-bold h-7 cursor-pointer active:scale-[0.97]"
                        >
                          {ratio}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => store.handleGenerate(urlList)}
                    disabled={urlList.length === 0 || store.generationStatus === "loading"}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs h-10 shadow-lg gap-2 cursor-pointer active:scale-[0.97]"
                  >
                    {store.generationStatus === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating Batch ({Math.round(store.generationProgress)}%)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current" /> Generate Carousel ({urlList.length})
                      </>
                    )}
                  </Button>
                </div>
              </FramePanel>
            </Frame>
          </div>

          {/* ============================================================ */}
          {/* NODE 7: LIVE REAL-TIME VISUAL CANVAS OUTPUT PREVIEW NODE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[460px] z-10 shadow-2xl"
            style={{ left: `${nodes.preview.x}px`, top: `${nodes.preview.y}px` }}
          >
            <Frame variant="default" spacing="default" className="border-2 border-primary/60 bg-card">
              <FramePanel className="p-0 overflow-hidden">
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown("preview", e)}
                  className="flex items-center justify-between p-3 bg-muted/60 border-b border-border/40 cursor-move"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Eye className="w-4 h-4 text-primary" /> 7. Live Real-Time Visual Canvas Preview
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                    Interactive Preview
                  </Badge>
                </div>
                <div className="p-4 bg-muted/10">
                  <GenerationPreview status="idle" />
                </div>
              </FramePanel>
            </Frame>
          </div>

        </div>
      </div>

      {/* GLOBAL FULL-WIDTH MODAL DIALOGS */}
      <BackgroundSelectorModal
        open={isBgModalOpen}
        onOpenChange={setIsBgModalOpen}
        selectedFilename={store.settings.customBgImage}
        onSelect={(filename) => {
          store.updateSetting("bgType", "custom");
          store.updateSetting("customBgImage", filename);
          store.updateSetting("showBlurredBg", false);
        }}
      />

      <FontSelectorModal
        open={isFontModalOpen}
        onOpenChange={setIsFontModalOpen}
        selectedFontFamily={store.settings.fontFamily || "Inter"}
        onSelect={(family) => store.updateSetting("fontFamily", family)}
      />
    </div>
  );
}
