"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Bookmark, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useSoundContext } from "@/components/sound-provider";

interface SiteHeaderProps {
  activeTab: string;
  urlCount?: number;
  onSyncStore?: () => void;
  onOpenStagingDrawer?: () => void;
  onOpenPresetDialog?: () => void;
  onQuickLoadTechStack?: () => void;
  onQuickLoadUIKitStack?: () => void;
  onQuickLoadAIToolsStack?: () => void;
  onQuickClearInputs?: () => void;
}

export function SiteHeader({
  activeTab,
  urlCount = 0,
  onSyncStore,
  onOpenStagingDrawer,
  onOpenPresetDialog,
  onQuickLoadTechStack,
  onQuickLoadUIKitStack,
  onQuickLoadAIToolsStack,
  onQuickClearInputs,
}: SiteHeaderProps) {
  const titleMap: Record<string, string> = {
    outputs: "Outputs Gallery & Scheduler",
    studio: "Studio Generator",
    templates: "Design Templates",
    backgrounds: "Custom Backgrounds",
    fonts: "Custom Fonts",
    "urls-db": "Library",
  };

  const displayTitle = titleMap[activeTab] || activeTab.replace("-", " ");
  const { isMuted, toggleMute } = useSoundContext();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) px-4 lg:px-6">
      <div className="flex w-full items-center justify-between gap-2">
        {/* Left: Dynamic Header Title */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <h1 className="text-sm md:text-base font-bold text-foreground capitalize">{displayTitle}</h1>
          {activeTab === "studio" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-[10px] ml-1">
              {urlCount} staged
            </Badge>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMute}
            title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-muted-foreground/60" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSyncStore}
            className="gap-1.5 text-xs font-medium h-8 px-2.5 sm:px-3 cursor-pointer active:scale-[0.97] transition-all"
            title="Sync Store Data"
          >
            <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sync Store</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenStagingDrawer}
            className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 font-medium h-8 px-2.5 sm:px-3 cursor-pointer active:scale-[0.97] transition-all"
            title="Open Staging Drawer"
          >
            <Bookmark className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Staging</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenPresetDialog}
            className="gap-1.5 text-xs font-medium h-8 px-2.5 sm:px-3 cursor-pointer active:scale-[0.97] transition-all"
            title="Save Current Settings as Template"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" /> <span className="hidden sm:inline">Save Template</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
