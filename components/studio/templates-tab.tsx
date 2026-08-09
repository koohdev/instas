import { useState } from "react";
import { Layers, Play, Trash2, Plus, Edit2, Eye, Bookmark, ArrowRight, Send, Sparkles, Heart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { TemplateManager } from "./template-manager";
import { TemplateEditorView } from "./template-editor-view";
import type { DesignTemplate } from "@/lib/templateStore";

export function TemplatesTab() {
  const store = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DesignTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [previewSlideMode, setPreviewSlideMode] = useState<"cover" | "content">("cover");

  const handleDelete = async (id: string) => {
    const updated = store.templates.filter((t) => t.id !== id);
    useAppStore.setState({ templates: updated });
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templates: updated }),
    });
  };

  const handleApply = (item: any) => {
    store.applyTemplate(item);
    store.setActiveTab("studio");
  };

  // IF EDITING A TEMPLATE: Replace the entire view with TemplateEditorView (NO MODAL)
  if (editingTemplate) {
    return (
      <TemplateEditorView
        template={editingTemplate}
        onBack={() => setEditingTemplate(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h3 className="text-2xl font-bold font-heading flex items-center gap-2 text-foreground">
            <Layers className="w-6 h-6 text-primary" /> Design Templates
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Unified templates covering visuals, covers, backgrounds, and branding. Stored in{" "}
            <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              data/templates.json
            </code>.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Save Current as Template
        </Button>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {store.templates.map((item) => (
          <Frame key={item.id} variant="default" spacing="default" className="hover:border-primary/40 transition-all">
            <FramePanel className="gap-4">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-base font-bold text-foreground">{item.name}</h4>
                {item.isDefault && (
                  <Badge variant="outline" className="border-primary/40 text-primary text-[10px] bg-primary/10">
                    Default
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">{item.description}</p>

              <Frame variant="default" spacing="sm">
                <FramePanel dense className="grid grid-cols-2 gap-2.5 p-3.5 text-[11px] bg-muted/20">
                  <div className="col-span-2 pb-1 border-b border-border/40 mb-1">
                    <span className="font-semibold text-foreground text-xs">{item.coverTitle || "Sample Title"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Radius:</span>{" "}
                    <span className="font-mono font-medium text-foreground">{item.borderRadius ?? 24}px</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blur:</span>{" "}
                    <span className="font-mono font-medium text-foreground">{item.blurAmount ?? 10}px</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bg Type:</span>{" "}
                    <span className="font-medium text-foreground uppercase">{item.bgType || "gradient"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Branding:</span>{" "}
                    <span className="font-medium text-foreground">{item.topLeftText || "INSTAS"}</span>
                  </div>
                </FramePanel>
              </Frame>

              {/* Template Card Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleApply(item)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Apply Template
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewTemplate(item)}
                    className="text-xs gap-1.5 font-semibold border-border/80 hover:bg-primary/10 hover:text-primary"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" /> Live Preview
                  </Button>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(item)}
                    className="text-xs gap-1 hover:bg-muted/50"
                  >
                    <Edit2 className="w-3 h-3 text-muted-foreground" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </FramePanel>
          </Frame>
        ))}
      </div>

      <TemplateManager open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Live Canvas Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-[460px] sm:max-w-[460px] w-full bg-card border-border/80 p-4 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <DialogHeader className="pb-0">
              <div className="flex items-center justify-between gap-3 pr-4">
                <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2 truncate">
                  <Eye className="w-4 h-4 text-primary shrink-0" /> Live Canvas: {previewTemplate.name}
                </DialogTitle>
                <Badge variant="outline" className="border-primary/40 text-primary text-[10px] uppercase shrink-0">
                  {previewTemplate.bgType || "gradient"}
                </Badge>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground pt-0.5">
                Preview how this template renders on live carousel slides.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-1">
              {/* Slide Mode Switcher */}
              <div className="flex items-center justify-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 w-full">
                <Button
                  variant={previewSlideMode === "cover" ? "default" : "ghost"}
                  size="xs"
                  onClick={() => setPreviewSlideMode("cover")}
                  className="text-xs font-semibold h-7 flex-1"
                >
                  Cover Slide
                </Button>
                <Button
                  variant={previewSlideMode === "content" ? "default" : "ghost"}
                  size="xs"
                  onClick={() => setPreviewSlideMode("content")}
                  className="text-xs font-semibold h-7 flex-1"
                >
                  Content Slide (01)
                </Button>
              </div>

              {/* Live Canvas Box */}
              <div className="p-2 rounded-xl border border-border/70 bg-card/80 shadow-md">
                <div
                  className="relative aspect-[4/5] w-full rounded-lg overflow-hidden border border-border/80 bg-[#0d0d0d] flex flex-col items-center justify-center p-6 transition-all duration-300 shadow-xl"
                  style={{
                    fontFamily: `'${previewTemplate.fontFamily || "Inter"}', sans-serif`,
                  }}
                >
                  {/* Visual Background */}
                  {previewTemplate.bgType === "custom" && previewTemplate.customBgImage && (
                    <img
                      src={`/api/backgrounds/${encodeURIComponent(previewTemplate.customBgImage)}`}
                      alt="Template Background"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-80"
                    style={{
                      background:
                        previewTemplate.coverStyle === "bold"
                          ? "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.3) 0%, transparent 60%)"
                          : previewTemplate.coverStyle === "minimal"
                          ? "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.2) 0%, transparent 70%)"
                          : "radial-gradient(circle at 50% 30%, rgba(99,102,241,0.4) 0%, rgba(15,23,42,0.9) 70%)",
                    }}
                  />

                  {/* Canvas Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2.5 w-full">
                    {previewSlideMode === "cover" ? (
                      <>
                        <h2 className="text-lg font-bold tracking-tight text-white leading-snug">
                          {previewTemplate.coverTitle || "STOP MAKING YOUR OWN COMPONENTS"}
                        </h2>
                        <p className="text-[11px] text-white/70 max-w-[280px] leading-relaxed">
                          {previewTemplate.coverSubtitle || "A CURATED LIST OF HIGH-QUALITY UI KITS & DESIGN TOOLS TO COPY AND PASTE"}
                        </p>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-[10px] mb-0.5">
                          Resource #01
                        </Badge>
                        <h3 className="text-base font-bold text-white">Shadcn / UI Library</h3>
                        <p className="text-[11px] text-white/70 max-w-[280px] leading-relaxed">
                          Beautifully designed components that you can copy and paste into your apps.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Canvas Branding Corner Elements */}
                  <span className="absolute top-3.5 left-4 text-[10px] font-bold text-white/70 tracking-wider uppercase z-10">
                    {previewTemplate.topLeftText || "INSTAS"}
                  </span>
                  <span className="absolute top-3.5 right-4 text-[10px] font-semibold text-white/60 tracking-wider uppercase z-10">
                    {previewTemplate.topRightText || "RESOURCES"}
                  </span>
                  <span className="absolute bottom-3.5 left-4 text-[10.5px] font-semibold text-white/50 z-10">
                    01
                  </span>
                  <span className="absolute bottom-3.5 right-4 text-[10px] font-medium text-white/60 z-10 flex items-center gap-1.5">
                    {previewTemplate.bottomRightText && <span>{previewTemplate.bottomRightText}</span>}
                    {previewTemplate.bottomRightIcon === "arrow-right" && <ArrowRight className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "send" && <Send className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "sparkles" && <Sparkles className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "heart" && <Heart className="w-3.5 h-3.5 text-white/80" />}
                    {previewTemplate.bottomRightIcon === "tag" && <Tag className="w-3.5 h-3.5 text-white/80" />}
                    {(!previewTemplate.bottomRightIcon || previewTemplate.bottomRightIcon === "bookmark") && (
                      <Bookmark className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                  className="text-xs font-semibold h-8 px-3"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleApply(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 h-8 px-4"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Apply Template to Studio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
