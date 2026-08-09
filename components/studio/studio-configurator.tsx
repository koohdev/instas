import { useState } from "react";
import { CheckCheck, Sparkles, RotateCcw, Sliders, Type, LayoutGrid } from "lucide-react";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/lib/store";
import { sanitizeUrls } from "@/utils/url-sanitizer";

import { FontSelectorModal } from "./font-selector-modal";

export function StudioConfigurator() {
  const store = useAppStore();
  const [sanitizedNotice, setSanitizedNotice] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSanitize = () => {
    if (!store.urls.trim()) return;
    const sanitized = sanitizeUrls(store.urls);
    store.setUrls(sanitized);
    setSanitizedNotice(true);
    setTimeout(() => setSanitizedNotice(false), 2500);

    // Auto-fill Cover Title from first URL if empty
    if (!store.settings.coverTitle && sanitized.length > 0) {
      const firstUrl = sanitized.split("\n")[0];
      try {
        const urlObj = new URL(firstUrl);
        const hostName = urlObj.hostname.replace(/^www\./, "");
        const title = hostName.charAt(0).toUpperCase() + hostName.slice(1);
        store.updateSetting("coverTitle", title);
        store.updateSetting("coverSubtitle", "Curated web developer resource");
      } catch {
        // quiet fail
      }
    }
  };

  const urlList = store.urls.split("\n").map(u => u.trim()).filter(Boolean);

  return (
    <Frame variant="default" spacing="default">
      <FramePanel className="gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Sliders className="w-4 h-4 text-primary" /> Studio Configurator
          </h3>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
            {urlList.length} site{urlList.length !== 1 ? "s" : ""} staged
          </Badge>
        </div>

        {/* UNIFIED CONTINUOUS FLOW (NO TAB SWITCHING) */}
        <div className="flex flex-col gap-6">

          {/* SECTION 1: TARGET WEBPAGE URLS & OUTPUT FOLDER */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  1. Target Webpage URLs
                </Label>
                <p className="text-[11px] text-muted-foreground">Paste URLs below (one per line). Parameters are sanitized automatically.</p>
              </div>
              {sanitizedNotice && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  <CheckCheck className="w-3 h-3 mr-1" /> Cleaned!
                </Badge>
              )}
            </div>

            <Textarea
              rows={5}
              placeholder={"https://reactbits.dev\nhttps://framer.com"}
              value={store.urls}
              onChange={(e) => store.setUrls(e.target.value)}
              onBlur={handleSanitize}
              className="font-mono text-base md:text-xs bg-muted/20 border-border"
            />

            <div>
              <Label className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">
                Output Folder Name (Optional)
              </Label>
              <Input
                placeholder="e.g. Design-Tools-Worth-Bookmarking"
                value={store.batchName}
                onChange={(e) => store.setBatchName(e.target.value)}
                className="text-base md:text-xs"
              />
            </div>
          </div>

          {/* SECTION 2: COVER LAYOUT & TYPOGRAPHY (PLACED DIRECTLY BELOW OUTPUT FOLDER NAME) */}
          <div className="flex flex-col gap-4 pt-4 border-t border-border/40">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-primary" /> 2. Cover Layout & Typography
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Cover Design Style</Label>
                <Select
                  value={store.settings.coverStyle}
                  onValueChange={(val: any) => store.updateSetting("coverStyle", val)}
                >
                  <SelectTrigger className="w-full h-9 text-xs capitalize">
                    <SelectValue placeholder="Select cover style..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Typography & Font Family</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFontModalOpen(true)}
                  className="w-full h-9 text-xs justify-between font-semibold"
                >
                  <span className="truncate" style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}>
                    {store.settings.fontFamily || "Inter"}
                  </span>
                  <Type className="w-3.5 h-3.5 text-primary shrink-0" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">Cover Title</Label>
                <Input
                  placeholder="Stop making your own components"
                  value={store.settings.coverTitle}
                  onChange={(e) => store.updateSetting("coverTitle", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">Cover Subtitle</Label>
                <Input
                  placeholder="A curated list of UI kits to copy and paste"
                  value={store.settings.coverSubtitle}
                  onChange={(e) => store.updateSetting("coverSubtitle", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: ASPECT RATIO & VISUAL CONTROLS (PLACED DIRECTLY BELOW COVER) */}
          <div className="flex flex-col gap-4 pt-4 border-t border-border/40">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" /> 3. Aspect Ratio & Visual Controls
            </Label>

            <div className="grid gap-2">
              <Label className="text-xs uppercase font-semibold text-muted-foreground">Canvas Aspect Ratio</Label>
              <Select
                value={store.aspectRatio}
                onValueChange={(val: any) => store.setAspectRatio(val)}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Select aspect ratio..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4:5">4:5 (Instagram Feed 1080×1350)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square Feed 1080×1080)</SelectItem>
                  <SelectItem value="9:16">9:16 (Instagram Story 1080×1920)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs uppercase font-semibold text-muted-foreground">Design Template Preset</Label>
              {(() => {
                const activeTpl = store.templates.find(
                  (t) => t.id === (store.settings as any).activeTemplateId || t.customBgImage === store.settings.customBgImage
                );
                return (
                  <Select
                    value={(store.settings as any).activeTemplateId || activeTpl?.id || ""}
                    onValueChange={(tplId: any) => {
                      if (!tplId) return;
                      const found = store.templates.find((t) => t.id === tplId);
                      if (found) {
                        store.applyTemplate(found);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue>
                        {activeTpl ? activeTpl.name : "Select design template preset..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {store.templates.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>
          </div>

        </div>
      </FramePanel>

      <FontSelectorModal
        open={isFontModalOpen}
        onOpenChange={setIsFontModalOpen}
        selectedFontFamily={store.settings.fontFamily || "Inter"}
        onSelect={(family) => store.updateSetting("fontFamily", family)}
      />
    </Frame>
  );
}
