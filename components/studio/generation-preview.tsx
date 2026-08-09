import { useState } from "react";
import { Bookmark, ArrowRight, Send, Sparkles, Heart, Tag } from "lucide-react";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";

export function GenerationPreview({ status }: { status: string }) {
  const store = useAppStore();
  const [previewSlideMode, setPreviewSlideMode] = useState<"cover" | "content">("cover");

  const urlList = store.urls.split("\n").map(u => u.trim()).filter(Boolean);
  const firstStagedUrl = urlList[0] || "";
  const stagedMatch = store.savedUrls.find(
    (u) => firstStagedUrl && u.url.toLowerCase().includes(firstStagedUrl.toLowerCase().replace(/^https?:\/\//, "").split("/")[0])
  );

  const previewSiteTitle = stagedMatch?.title || (firstStagedUrl ? firstStagedUrl.replace(/^https?:\/\//, "").split("/")[0] : "Pillarstack");
  const previewSiteUrl = stagedMatch?.url.replace(/^https?:\/\//, "") || (firstStagedUrl ? firstStagedUrl.replace(/^https?:\/\//, "") : "pillarstack.com");
  const previewSiteDesc = stagedMatch?.category
    ? `${stagedMatch.category} · Curated web developer resource`
    : "Hand-picked award-winning portfolios and modern SaaS landing pages";

  // Match active custom background from store backgroundList (or fallback to route)
  const activeBgItem = store.backgroundList.find(b => b.filename === store.settings.customBgImage);
  const activeBgUrl = activeBgItem?.url || (store.settings.customBgImage ? `/api/backgrounds/${encodeURIComponent(store.settings.customBgImage)}` : "");

  return (
    <Frame className="lg:sticky lg:top-24 w-full flex flex-col" variant="default" spacing="default">
      <FramePanel className="gap-4 flex flex-col p-4">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
            <Button
              variant={previewSlideMode === "cover" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewSlideMode("cover")}
              className="text-[11px] h-6 px-2.5 rounded-md font-semibold"
            >
              Cover Slide
            </Button>
            <Button
              variant={previewSlideMode === "content" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewSlideMode("content")}
              className="text-[11px] h-6 px-2.5 rounded-md font-semibold"
            >
              Content Slide (01)
            </Button>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary capitalize">
            {store.aspectRatio} · {store.settings.coverStyle}
          </Badge>
        </div>

        {/* Single Synchronized Visual Canvas */}
        <div
          className={`${
            store.aspectRatio === "1:1"
              ? "aspect-[1/1]"
              : store.aspectRatio === "9:16"
              ? "aspect-[9/16]"
              : "aspect-[4/5]"
          } w-full rounded-xl overflow-hidden border border-border/80 relative bg-[#0d0d0d] flex flex-col items-center justify-center p-6 shadow-2xl`}
        >
          {/* Noise Overlay */}
          {store.settings.noiseOpacity > 0 && (
            <div
              className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
              style={{
                opacity: store.settings.noiseOpacity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundSize: "200px 200px",
              }}
            />
          )}

          {/* ────────────────── MODE 1: COVER SLIDE ────────────────── */}
          {previewSlideMode === "cover" && (
            <>
              {store.settings.bgType === "custom" && activeBgUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url("${activeBgUrl}")` }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#0d0d0d_0%,#1a1a2e_50%,#0d0d0d_100%)] pointer-events-none" />
                  <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] pb-[75%] rounded-full bg-[radial-gradient(circle,rgba(120,80,255,0.2)_0%,transparent_70%)] pointer-events-none" />
                </>
              )}

              {store.settings.bgType === "custom" && (
                <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center max-w-[90%] px-2">
                <h1
                  className="font-extrabold text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-[1.08] drop-shadow-md"
                  style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}
                >
                  {store.settings.coverTitle || "Your Title Here"}
                </h1>
                {store.settings.coverSubtitle && (
                  <p
                    className="text-xs md:text-sm text-white/60 mt-3.5 font-normal leading-relaxed max-w-[90%]"
                    style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}
                  >
                    {store.settings.coverSubtitle}
                  </p>
                )}
              </div>

              <span
                className="absolute top-4 left-5 text-[11px] font-semibold text-white/85 tracking-tight z-10"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}
              >
                {store.settings.topLeftText}
              </span>
              <span
                className="absolute top-4 right-5 text-[10px] font-semibold text-white/60 tracking-wider uppercase z-10"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}
              >
                {store.settings.topRightText}
              </span>
              <span
                className="absolute bottom-4 left-5 text-[10.5px] font-semibold text-white/50 z-10"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}
              >
                {store.settings.bottomLeftText}
              </span>
              <span
                className="absolute bottom-4 right-5 text-[10px] font-medium text-white/60 z-10 flex items-center gap-1.5"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}
              >
                {store.settings.bottomRightText && <span>{store.settings.bottomRightText}</span>}
                {(store.settings.bottomRightIcon === "bookmark" || !store.settings.bottomRightIcon) && <Bookmark className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "arrow-right" && <ArrowRight className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "send" && <Send className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "sparkles" && <Sparkles className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "heart" && <Heart className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "tag" && <Tag className="w-3.5 h-3.5 text-white/80" />}
              </span>
            </>
          )}

          {/* ────────────────── MODE 2: CONTENT SLIDE ────────────────── */}
          {previewSlideMode === "content" && (
            <>
              {store.settings.bgType === "custom" && activeBgUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${activeBgUrl}")` }}
                />
              ) : store.settings.showBlurredBg ? (
                <div
                  className="absolute inset-0 bg-[linear-gradient(135deg,rgba(80,40,180,0.45),rgba(20,20,40,0.95))]"
                  style={{ filter: `blur(${Math.min(store.settings.blurAmount, 10)}px)` }}
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(145deg,#0d0d0d_0%,#161626_50%,#0d0d0d_100%)]" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.6)_60%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

              {status === "loading" ? (
                <Skeleton
                  className="absolute left-[7.41%] w-[85.18%] z-10 rounded-xl bg-violet-500/20 animate-pulse border border-violet-500/30 flex items-center justify-center transition-all"
                  style={{
                    top: `${((store.settings.screenshotTop ?? 240) / 1350) * 100}%`,
                    height: `${((store.settings.screenshotHeight ?? 520) / 1350) * 100}%`,
                  }}
                >
                  <span className="text-[10px] text-violet-300 font-medium">Capturing & Rendering...</span>
                </Skeleton>
              ) : (
                <div
                  className="absolute left-[7.41%] w-[85.18%] bg-[#ffffff10] border border-white/20 z-10 flex flex-col overflow-hidden transition-all shadow-xl"
                  style={{
                    top: `${((store.settings.screenshotTop ?? 240) / 1350) * 100}%`,
                    height: `${((store.settings.screenshotHeight ?? 520) / 1350) * 100}%`,
                    borderRadius: `${store.settings.borderRadius}px`,
                  }}
                >
                  <div className="h-5 bg-white/10 border-b border-white/15 px-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80 inline-block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 inline-block" />
                    </div>
                    <span className="text-[8px] font-mono text-white/50 truncate max-w-[140px]">
                      https://{previewSiteUrl}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-black/40">
                    <span className="text-[10px] text-white/40 font-mono">
                      Hero Screenshot: {previewSiteUrl}
                    </span>
                  </div>
                </div>
              )}

              <h2
                className="absolute left-[7.41%] w-[85.18%] z-10 font-bold text-sm md:text-base text-white tracking-tight leading-snug truncate transition-all"
                style={{ top: `${((store.settings.titleTop ?? 790) / 1350) * 100}%` }}
              >
                {previewSiteTitle}
              </h2>

              <p
                className="absolute left-[7.41%] w-[85.18%] z-10 text-[11px] text-white/60 line-clamp-2 leading-relaxed transition-all"
                style={{ top: `${((store.settings.subtitleTop ?? 854) / 1350) * 100}%` }}
              >
                {previewSiteDesc}
              </p>

              <div
                className="absolute left-[7.41%] w-[85.18%] h-7 z-10 flex justify-center items-center pointer-events-none transition-all"
                style={{ top: `${((store.settings.urlPillTop ?? 1000) / 1350) * 100}%` }}
              >
                <div className="px-3.5 py-1 rounded-full bg-white/10 border border-white/25 text-[10px] font-semibold text-white shadow-md">
                  {previewSiteUrl}
                </div>
              </div>

              <span className="absolute top-4 left-5 text-[11px] font-semibold text-white/85 tracking-tight z-10"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}>
                {store.settings.topLeftText}
              </span>
              <span className="absolute top-4 right-5 text-[10px] font-semibold text-white/60 tracking-wider uppercase z-10"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}>
                {store.settings.topRightText}
              </span>
              <span className="absolute bottom-4 left-5 text-[10.5px] font-semibold text-white/50 z-10"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}>
                01
              </span>
              <span className="absolute bottom-4 right-5 text-[10px] font-medium text-white/60 z-10 flex items-center gap-1.5"
                style={{ fontFamily: `'${store.settings.fontFamily || "Inter"}', sans-serif` }}>
                {store.settings.bottomRightText && <span>{store.settings.bottomRightText}</span>}
                {(store.settings.bottomRightIcon === "bookmark" || !store.settings.bottomRightIcon) && <Bookmark className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "arrow-right" && <ArrowRight className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "send" && <Send className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "sparkles" && <Sparkles className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "heart" && <Heart className="w-3.5 h-3.5 text-white/80" />}
                {store.settings.bottomRightIcon === "tag" && <Tag className="w-3.5 h-3.5 text-white/80" />}
              </span>
            </>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          Live Visual Canvas · Displaying {previewSlideMode === "cover" ? "Cover Slide" : `Content Slide (${previewSiteUrl})`} · Export: {store.aspectRatio}
        </p>
      </FramePanel>
    </Frame>
  );
}
