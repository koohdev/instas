"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, SlidersHorizontal, Network } from "lucide-react";

import { StudioConfigurator } from "@/components/studio/studio-configurator";
import { CanvasFlowEditor } from "@/components/studio/canvas-flow-editor";
import { GenerationPreview } from "@/components/studio/generation-preview";
import { GenerationStatus } from "@/components/studio/generation-status";
import { TemplatesTab } from "@/components/studio/templates-tab";
import { UrlLibraryTab } from "@/components/studio/url-library-tab";
import { BackgroundsManager } from "@/components/backgrounds-manager";
import { StagingDrawer } from "@/components/studio/staging-drawer";
import { TemplateManager } from "@/components/studio/template-manager";

import { FontsManager } from "@/components/fonts-manager";

import { OutputsManager } from "@/components/outputs/outputs-manager";

interface AppShellProps {
  activeRoute?: "outputs" | "studio" | "templates" | "backgrounds" | "urls-db" | "fonts";
}

import { SoundProvider } from "@/components/sound-provider";

export function AppShell({ activeRoute }: AppShellProps) {
  const store = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [studioViewMode, setStudioViewMode] = useState<"form" | "canvas">("form");

  const fetchData = store.fetchData;
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentTab = activeRoute || (
    pathname === "/outputs"
      ? "outputs"
      : pathname === "/templates"
      ? "templates"
      : pathname === "/backgrounds"
      ? "backgrounds"
      : pathname === "/fonts"
      ? "fonts"
      : pathname === "/library" || pathname === "/liblary"
      ? "urls-db"
      : "studio"
  );

  const setActiveTab = store.setActiveTab;
  useEffect(() => {
    if (store.activeTab !== currentTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab, store.activeTab, setActiveTab]);

  const handleNavigateTab = (tab: string) => {
    store.setActiveTab(tab);
    if (tab === "outputs") router.push("/outputs");
    else if (tab === "studio") router.push("/dashboard");
    else if (tab === "templates") router.push("/templates");
    else if (tab === "backgrounds") router.push("/backgrounds");
    else if (tab === "fonts") router.push("/fonts");
    else if (tab === "urls-db") router.push("/library");
  };

  const urlCount = store.urls.split("\n").map((u) => u.trim()).filter(Boolean).length;

  return (
    <SoundProvider>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties}
      >
        <AppSidebar
          activeTab={currentTab}
          setActiveTab={handleNavigateTab}
          onSyncStore={store.fetchData}
          variant="inset"
        />
        <SidebarInset>
          <SiteHeader
            activeTab={currentTab}
            urlCount={urlCount}
            studioViewMode={studioViewMode}
            onStudioViewModeChange={setStudioViewMode}
            onSyncStore={store.fetchData}
            onOpenStagingDrawer={() => setIsAssetDrawerOpen(true)}
            onOpenPresetDialog={() => setIsPresetDialogOpen(true)}
            onQuickLoadTechStack={() => {
              store.setUrls("https://reactbits.dev\nhttps://framer.com\nhttps://linear.app");
              handleNavigateTab("studio");
            }}
            onQuickLoadUIKitStack={() => {
              store.setUrls("https://shadcn.com\nhttps://tailwindcss.com\nhttps://lucide.dev");
              handleNavigateTab("studio");
            }}
            onQuickLoadAIToolsStack={() => {
              store.setUrls("https://cursor.com\nhttps://v0.dev\nhttps://bolt.new");
              handleNavigateTab("studio");
            }}
            onQuickClearInputs={() => {
              store.setUrls("");
              store.setBatchName("");
              store.updateSetting("coverTitle", "");
              store.updateSetting("coverSubtitle", "");
            }}
          />

          <StagingDrawer open={isAssetDrawerOpen} onOpenChange={setIsAssetDrawerOpen} />
          <TemplateManager open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen} />

          {/* Background Generation Live Banner (Shows when navigating outside studio during generation) */}
          {store.generationStatus === "loading" && currentTab !== "studio" && (
            <div className="bg-primary text-primary-foreground border-b border-primary/30 px-4 py-2 flex items-center justify-between gap-4 text-xs shadow-md">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground shrink-0" />
                <span className="font-semibold truncate">
                  {store.generationStatusMessage || "Generating Carousel Batch..."} ({Math.round(store.generationProgress)}%)
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleNavigateTab("studio")}
                className="text-xs font-bold shrink-0 h-6 px-2.5 gap-1 bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                View Progress
              </Button>
            </div>
          )}

          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 flex-1">
                
                {currentTab === "outputs" && <OutputsManager />}

                {currentTab === "studio" && (
                  <div className="flex flex-col gap-6 w-full">
                    {studioViewMode === "canvas" ? (
                      <div className="w-full flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
                        <CanvasFlowEditor />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] 2xl:grid-cols-[1fr_540px] gap-8 w-full items-start">
                        <div className="flex flex-col gap-6 w-full">
                          <StudioConfigurator />
                          <GenerationStatus />
                        </div>
                        <GenerationPreview status="idle" />
                      </div>
                    )}
                  </div>
                )}

                {currentTab === "templates" && <TemplatesTab />}

                {currentTab === "urls-db" && <UrlLibraryTab />}

                {currentTab === "fonts" && <FontsManager />}

                {currentTab === "backgrounds" && (
                  <BackgroundsManager
                    activeBackground={store.settings.customBgImage}
                    onSelectBackground={(bgFilename) => {
                      store.updateSetting("bgType", "custom");
                      store.updateSetting("customBgImage", bgFilename);
                      store.updateSetting("showBlurredBg", false);
                      handleNavigateTab("studio");
                    }}
                  />
                )}

              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SoundProvider>
  );
}
