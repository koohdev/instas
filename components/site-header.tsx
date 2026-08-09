"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Bookmark, Sparkles, Network } from "lucide-react";

interface SiteHeaderProps {
  activeTab: string;
  urlCount?: number;
  studioViewMode?: "form" | "canvas";
  onStudioViewModeChange?: (mode: "form" | "canvas") => void;
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

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) px-4 lg:px-6">
      <div className="flex w-full items-center justify-between gap-2">
        {/* Left: Breadcrumb Context with staged count pill inline */}
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <div className="w-px h-4 bg-border/80 shrink-0 mx-0.5" />

          <Breadcrumb>
            <BreadcrumbList className="text-xs sm:text-sm font-medium flex items-center">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-none">
                  {displayTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {activeTab === "studio" && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-2 py-0.5 font-medium shrink-0 rounded-full ml-1"
            >
              {urlCount} staged
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
