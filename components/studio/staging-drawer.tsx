import { Check, Bookmark, Play } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

interface StagingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StagingDrawer({ open, onOpenChange }: StagingDrawerProps) {
  const store = useAppStore();

  const handleToggleUrl = (itemUrl: string) => {
    const lines = store.urls.split("\n").map((u) => u.trim()).filter(Boolean);
    if (lines.includes(itemUrl.trim())) {
      store.setUrls(lines.filter((u) => u !== itemUrl.trim()).join("\n"));
    } else {
      store.setUrls([...lines, itemUrl.trim()].join("\n"));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="top-2.5 bottom-2.5 right-2.5 h-[calc(100vh-20px)] max-h-[calc(100vh-20px)] w-[calc(100vw-20px)] max-w-full sm:max-w-[480px] rounded-[var(--radius-xl)] border border-border bg-card text-foreground p-0 overflow-hidden shadow-2xl z-50"
      >
        <Frame variant="default" spacing="default" className="h-full border-none rounded-[var(--radius-xl)] bg-card">
          <FramePanel className="h-full flex flex-col p-5 gap-4 overflow-y-auto">
            <SheetHeader className="pb-3 border-b border-border/60 p-0">
              <SheetTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Bookmark className="w-4 h-4 text-primary" /> In-Studio Staging Drawer
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Inject saved URLs or visual style templates directly into your active studio workspace.
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="urls-drawer" className="flex flex-col gap-4 flex-1">
              <TabsList className="grid grid-cols-2 bg-muted/60 p-1">
                <TabsTrigger value="urls-drawer" className="text-xs font-semibold">
                  Saved URLs ({store.savedUrls.length})
                </TabsTrigger>
                <TabsTrigger value="presets-drawer" className="text-xs font-semibold">
                  Templates ({store.templates.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="urls-drawer" className="flex flex-col gap-3 flex-1">
                <p className="text-xs text-muted-foreground">
                  Toggle saved URLs to stage or unstage them continuously:
                </p>
                {store.savedUrls.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-6 text-center">
                    No saved URLs in database yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {store.savedUrls.map((item) => {
                      const currentLines = store.urls.split("\n").map((u) => u.trim()).filter(Boolean);
                      const isStaged = currentLines.includes(item.url.trim());
                      return (
                        <Frame
                          key={item.id}
                          variant="default"
                          spacing="sm"
                          className={`cursor-pointer transition-all ${
                            isStaged ? "border-primary/60 bg-primary/10" : "hover:border-primary/40"
                          }`}
                          onClick={() => handleToggleUrl(item.url)}
                        >
                          <FramePanel dense className="p-3.5 group">
                            <div className="flex flex-row items-center justify-between w-full text-left">
                              <div className="flex flex-col items-start min-w-0 pr-3 text-left">
                                <span className="font-bold text-xs text-foreground group-hover:text-primary truncate">
                                  {item.title}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground truncate">
                                  {item.url}
                                </span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                  isStaged
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-border/80 bg-muted/20 group-hover:border-primary/60"
                                }`}
                              >
                                {isStaged && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                          </FramePanel>
                        </Frame>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="presets-drawer" className="flex flex-col gap-3 flex-1">
                <p className="text-xs text-muted-foreground">
                  Select a template to apply it live:
                </p>
                <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {store.templates.map((p) => {
                    const isActive =
                      store.settings.blurAmount === p.blurAmount &&
                      store.settings.borderRadius === p.borderRadius &&
                      store.settings.topLeftText === p.topLeftText;

                    return (
                      <Frame
                        key={p.id}
                        variant="default"
                        spacing="sm"
                        className={`cursor-pointer transition-all ${
                          isActive ? "border-primary/60 bg-primary/10" : "hover:border-primary/40"
                        }`}
                        onClick={() => store.applyTemplate(p)}
                      >
                        <FramePanel dense className="p-3.5 group">
                          <div className="flex flex-row items-center justify-between w-full text-left">
                            <div className="flex flex-col items-start min-w-0 pr-3 text-left">
                              <span className="font-bold text-xs text-foreground group-hover:text-primary truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                Blur: {p.blurAmount}px · Radius: {p.borderRadius}px
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                isActive
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/80 bg-muted/20 group-hover:border-primary/60"
                              }`}
                            >
                              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </FramePanel>
                      </Frame>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </FramePanel>
        </Frame>
      </SheetContent>
    </Sheet>
  );
}
