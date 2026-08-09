import { useState, useRef, useEffect } from "react";
import { ArrowLeft, RefreshCw, Save, Check, Upload, Image as ImageIcon, Sliders, Type, Tag, ChevronDown, ChevronUp, Palette, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useAppStore } from "@/lib/store";
import { GenerationPreview } from "./generation-preview";
import { BackgroundSelectorModal } from "./background-selector-modal";
import { FontSelectorModal } from "./font-selector-modal";
import type { DesignTemplate } from "@/lib/templateStore";

interface TemplateEditorViewProps {
  template: DesignTemplate;
  onBack: () => void;
}

export function TemplateEditorView({ template, onBack }: TemplateEditorViewProps) {
  const store = useAppStore();
  const [formData, setFormData] = useState<DesignTemplate>({ ...template });
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize initial template values into store live settings and refresh background list
  useEffect(() => {
    store.applyTemplate(template);
    store.fetchData();
  }, [template]);

  // Section toggle states for collapsible panels
  const [openSections, setOpenSections] = useState({
    generalBrandingCover: true,
    visualsBg: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = <K extends keyof DesignTemplate>(key: K, value: DesignTemplate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    store.updateSetting(key as any, value as any);
  };

  const handleSelectBackground = (filename: string) => {
    setFormData((prev) => ({
      ...prev,
      bgType: "custom",
      customBgImage: filename,
      showBlurredBg: false,
    }));
    store.updateSetting("bgType", "custom");
    store.updateSetting("customBgImage", filename);
    store.updateSetting("showBlurredBg", false);
  };

  const handleSyncWithStudio = () => {
    setFormData((prev) => ({
      ...prev,
      ...store.settings,
    }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return;
    await store.updateTemplate(template.id, formData);
    onBack();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/backgrounds", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const result = await res.json();
        if (result.background) {
          await store.fetchData();
          handleSelectBackground(result.background.filename);
        }
      }
    } catch {
      // quiet handle
    } finally {
      setIsUploading(false);
    }
  };

  const activeBgItem = store.backgroundList.find(b => b.filename === formData.customBgImage);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            Editing Template: <span className="text-primary">{formData.name || "Untitled Template"}</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure layout, branding tags, typography, and custom background parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="text-xs gap-1.5 font-semibold hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Templates
          </Button>

          <Button
            onClick={handleSave}
            disabled={!formData.name?.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      {/* MAIN WORKSPACE GRID: Editor (Left) + Live Canvas Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
        
        {/* LEFT COLUMN: Configurator Sections */}
        <div className="xl:col-span-7 flex flex-col gap-6 w-full">

          {/* 1. UNIFIED SINGLE COLUMN STACK: General Details -> Corner Branding Tags -> Cover Layout & Typography */}
          <Frame variant="default" spacing="default">
            <FramePanel className="p-0 overflow-hidden">
              <div
                onClick={() => toggleSection("generalBrandingCover")}
                className="flex items-center justify-between p-4 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors border-b border-border/40"
              >
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Sliders className="w-4 h-4 text-primary" /> Template Info, Branding & Cover Layout
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {openSections.generalBrandingCover ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {openSections.generalBrandingCover && (
                <div className="p-5 flex flex-col gap-6">

                  {/* TOP ROW: 2 Columns - General Details & Corner Branding Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/40">

                    {/* COLUMN 1: General Details */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-primary" /> General Details
                      </h4>
                      <div className="grid gap-2">
                        <Label className="text-xs font-semibold">Template Name</Label>
                        <Input
                          className="text-xs"
                          placeholder="e.g. Minimalist Dark"
                          value={formData.name || ""}
                          onChange={(e) => handleChange("name", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs font-semibold">Description</Label>
                        <Input
                          className="text-xs"
                          placeholder="Brief summary..."
                          value={formData.description || ""}
                          onChange={(e) => handleChange("description", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* COLUMN 2: Corner Branding Tags */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" /> Corner Branding Tags
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label className="text-[11px] font-medium text-muted-foreground">Top-Left</Label>
                          <Input
                            className="text-xs font-mono h-8"
                            placeholder="@yourbrand"
                            value={formData.topLeftText || ""}
                            onChange={(e) => handleChange("topLeftText", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-[11px] font-medium text-muted-foreground">Top-Right</Label>
                          <Input
                            className="text-xs font-mono h-8"
                            placeholder="RESOURCES"
                            value={formData.topRightText || ""}
                            onChange={(e) => handleChange("topRightText", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label className="text-[11px] font-medium text-muted-foreground">Bottom-Left</Label>
                          <Input
                            className="text-xs font-mono h-8"
                            placeholder="Made with InstaScrape"
                            value={formData.bottomLeftText || ""}
                            onChange={(e) => handleChange("bottomLeftText", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-[11px] font-medium text-muted-foreground">Bottom-Right</Label>
                          <Input
                            className="text-xs font-mono h-8"
                            placeholder="SWIPE"
                            value={formData.bottomRightText || ""}
                            onChange={(e) => handleChange("bottomRightText", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-[11px] font-medium text-muted-foreground">Bottom-Right Action Icon</Label>
                        <Select
                          value={formData.bottomRightIcon || "bookmark"}
                          onValueChange={(val: any) => handleChange("bottomRightIcon", val)}
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bookmark">Bookmark Icon</SelectItem>
                            <SelectItem value="arrow-right">Arrow Right Icon</SelectItem>
                            <SelectItem value="send">Send Icon</SelectItem>
                            <SelectItem value="sparkles">Sparkles Icon</SelectItem>
                            <SelectItem value="heart">Heart Icon</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM ROW: Cover Layout & Typography (1 Column) */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-primary" /> Cover Layout & Typography
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-xs font-semibold">Cover Design Style</Label>
                        <Select
                          value={formData.coverStyle || "modern"}
                          onValueChange={(val: any) => handleChange("coverStyle", val)}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimal">Minimalist Layout</SelectItem>
                            <SelectItem value="bold">Bold & Vibrant</SelectItem>
                            <SelectItem value="modern">Modern Glass</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-xs font-semibold">Font Family ({formData.fontFamily || "Inter"})</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFontModalOpen(true)}
                          className="text-xs gap-1.5 justify-between font-semibold h-9"
                        >
                          <span className="truncate" style={{ fontFamily: `'${formData.fontFamily || "Inter"}', sans-serif` }}>
                            {formData.fontFamily || "Inter"}
                          </span>
                          <Type className="w-3.5 h-3.5 text-primary shrink-0" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-xs font-semibold">Default Cover Title</Label>
                        <Input
                          className="text-xs"
                          placeholder="e.g. Stop making your own components"
                          value={formData.coverTitle || ""}
                          onChange={(e) => handleChange("coverTitle", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs font-semibold">Default Cover Subtitle</Label>
                        <Input
                          className="text-xs"
                          placeholder="e.g. A curated list of high-quality UI kits"
                          value={formData.coverSubtitle || ""}
                          onChange={(e) => handleChange("coverSubtitle", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </FramePanel>
          </Frame>

          {/* 2. VISUAL CONTROLS & BACKGROUND SECTION */}
          <Frame variant="default" spacing="default">
            <FramePanel className="p-0 overflow-hidden border-2 border-primary/30">
              <div
                onClick={() => toggleSection("visualsBg")}
                className="flex items-center justify-between p-4 bg-primary/10 cursor-pointer hover:bg-primary/15 transition-colors border-b border-border/40"
              >
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Palette className="w-4 h-4 text-primary" /> Visual Controls & Background Selector
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {openSections.visualsBg ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {openSections.visualsBg && (
                <div className="p-5 flex flex-col gap-6">
                  {/* PART A: Visual Controls & Styling */}
                  <div className="flex flex-col gap-5 pb-5 border-b border-border/40">
                    <h4 className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-primary" /> Styling & Sliders
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <Label className="text-xs font-semibold">Screenshot Card Radius ({formData.borderRadius ?? 12}px)</Label>
                        </div>
                        <Slider
                          value={[formData.borderRadius ?? 12]}
                          min={0}
                          max={32}
                          step={1}
                          onValueChange={(val: any) => handleChange("borderRadius", Array.isArray(val) ? val[0] : val)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <Label className="text-xs font-semibold">Backdrop Blur ({formData.blurAmount ?? 12}px)</Label>
                        </div>
                        <Slider
                          value={[formData.blurAmount ?? 12]}
                          min={0}
                          max={40}
                          step={1}
                          onValueChange={(val: any) => handleChange("blurAmount", Array.isArray(val) ? val[0] : val)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <Label className="text-xs font-semibold">Outer Card Padding ({formData.cardPadding ?? 40}px)</Label>
                        </div>
                        <Slider
                          value={[formData.cardPadding ?? 40]}
                          min={0}
                          max={80}
                          step={2}
                          onValueChange={(val: any) => handleChange("cardPadding", Array.isArray(val) ? val[0] : val)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <Label className="text-xs font-semibold">Inner Card Radius ({formData.cardBorderRadius ?? 28}px)</Label>
                        </div>
                        <Slider
                          value={[formData.cardBorderRadius ?? 28]}
                          min={0}
                          max={48}
                          step={2}
                          onValueChange={(val: any) => handleChange("cardBorderRadius", Array.isArray(val) ? val[0] : val)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 pt-2">
                      <Label className="text-xs font-semibold">Frame Outer Background Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={formData.cardOuterBg || "#0C1014"}
                          onChange={(e) => handleChange("cardOuterBg", e.target.value)}
                          className="h-8 text-xs font-mono w-28 bg-muted/20"
                        />
                        <div className="flex items-center gap-1.5">
                          {[
                            { label: "Default Dark", hex: "#0C1014" },
                            { label: "Pure Black", hex: "#000000" },
                            { label: "Slate", hex: "#0F172A" },
                            { label: "Zinc", hex: "#18181B" },
                          ].map((color) => (
                            <button
                              key={color.hex}
                              type="button"
                              onClick={() => handleChange("cardOuterBg", color.hex)}
                              className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                                (formData.cardOuterBg || "#0C1014").toLowerCase() === color.hex.toLowerCase()
                                  ? "ring-2 ring-primary border-white scale-110"
                                  : "border-white/20 hover:scale-105"
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <Label className="text-xs font-semibold block">Drop Shadow</Label>
                        <span className="text-[11px] text-muted-foreground">Add realistic depth to screenshot cards</span>
                      </div>
                      <Switch
                        checked={formData.dropShadow ?? true}
                        onCheckedChange={(checked) => handleChange("dropShadow", checked)}
                      />
                    </div>
                  </div>

                  {/* PART B: Background Type Mode */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" /> Background Type Mode & Custom Image Selector
                    </h4>

                    <div className="grid gap-2 max-w-sm">
                      <Label className="text-xs font-semibold">Background Type Mode</Label>
                      <Select
                        value={formData.bgType || "default"}
                        onValueChange={(val: any) => handleChange("bgType", val)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Gradient</SelectItem>
                          <SelectItem value="blurred">Blurred Backdrop</SelectItem>
                          <SelectItem value="custom">Custom Image Background</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* MODAL TRIGGER FOR CUSTOM BACKGROUND SELECTOR */}
                    {formData.bgType === "custom" && (
                      <div className="flex flex-col gap-4 pt-3 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-primary" /> Custom Background Image
                            </Label>
                            <p className="text-[11px] text-muted-foreground">
                              Open the visual background grid modal to select or upload image pictures.
                            </p>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="text-xs gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/10"
                            >
                              <Upload className="w-3.5 h-3.5" /> {isUploading ? "Uploading..." : "Upload New"}
                            </Button>

                            <Button
                              onClick={() => setIsModalOpen(true)}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold"
                            >
                              <Grid className="w-3.5 h-3.5" /> Open Picture Grid Modal
                            </Button>
                          </div>
                        </div>

                        {/* Selected Background Picture Display Preview Card */}
                        {activeBgItem ? (
                          <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border-2 border-primary shadow-lg bg-neutral-950">
                            <img
                              src={activeBgItem.url}
                              alt={activeBgItem.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-black/70 backdrop-blur-md flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white truncate">{activeBgItem.name}</span>
                                <span className="text-[10px] text-white/60 font-mono truncate">{activeBgItem.filename}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsModalOpen(true)}
                                className="text-[10px] h-6 px-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(true)}
                            className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-center bg-card hover:bg-muted/20"
                          >
                            <ImageIcon className="w-6 h-6 text-primary" />
                            <span className="text-xs font-bold text-foreground">Click to browse custom background grid modal ({store.backgroundList.length} images)</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FramePanel>
          </Frame>

        </div>

        {/* RIGHT COLUMN: Sticky Live Visual Canvas Preview */}
        <div className="xl:col-span-5 flex flex-col gap-6 w-full">
          <div className="xl:sticky xl:top-6">
            <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2">Real-Time Visual Preview</h4>
            <GenerationPreview status="idle" />
          </div>
        </div>

      </div>

      {/* BACKGROUND SELECTOR MODAL DIALOG */}
      <BackgroundSelectorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedFilename={formData.customBgImage}
        onSelect={handleSelectBackground}
      />

      {/* FONT SELECTOR MODAL DIALOG */}
      <FontSelectorModal
        open={isFontModalOpen}
        onOpenChange={setIsFontModalOpen}
        selectedFontFamily={formData.fontFamily || "Inter"}
        onSelect={(family) => handleChange("fontFamily", family)}
      />
    </div>
  );
}
