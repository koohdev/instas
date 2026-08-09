import { useState } from "react";
import { Wand2, Play, CheckCheck, Folder, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useGeneration } from "@/hooks/useGeneration";
import { useAppStore } from "@/lib/store";

export function GenerationStatus() {
  const store = useAppStore();
  const { status, result, errorMsg, progress, statusMessage, handleGenerate } = useGeneration();
  const [copiedOutputPath, setCopiedOutputPath] = useState(false);

  const urlList = store.urls.split("\n").map(u => u.trim()).filter(Boolean);

  const onGenerateClick = () => {
    handleGenerate(urlList);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={onGenerateClick}
        disabled={status === "loading" || urlList.length === 0}
        className={`relative overflow-hidden w-full h-12 text-sm font-bold rounded-lg cursor-pointer transition-all duration-300 ${
          urlList.length === 0 && status !== "loading" ? "opacity-50 cursor-not-allowed" : ""
        } ${
          status === "loading"
            ? "bg-muted border border-border text-foreground"
            : status === "success"
            ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-500/20"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        }`}
      >
        {status === "loading" && (
          <div
            className="absolute inset-y-0 left-0 bg-primary/25 border-r-2 border-primary/80 transition-all duration-300 ease-out flex items-center justify-end overflow-hidden"
            style={{ width: `${Math.max(Math.round(progress), 4)}%` }}
          >
            {/* Subtle monochrome shine sweep */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-pulse" />
          </div>
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {status === "loading" ? (
            <>
              <Wand2 className="w-4 h-4 shrink-0 text-primary" />
              <span className="text-foreground">{statusMessage || `Generating (${urlList.length + 1} slides)...`}</span>
              <span className="font-mono text-xs font-bold text-primary">({Math.round(progress)}%)</span>
            </>
          ) : status === "success" ? (
            <>
              <CheckCheck className="w-4 h-4 stroke-[2.5]" />
              Carousel Batch Generated
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Generate Carousel ({urlList.length + 1} slides)
            </>
          )}
        </span>
      </Button>

      {/* Redesigned Success Result Card */}
      {result && (
        <Frame variant="default" spacing="sm" className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5 shadow-xl transition-all">
          <FramePanel dense className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs sm:text-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                </div>
                <span>Carousel Batch Generated</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                {result.slides.length} Slides Ready
              </Badge>
            </div>

            <div className="flex flex-col gap-1.5 bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-semibold text-foreground text-[11px] flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-primary" /> Output Path
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(result.outputDir);
                    setCopiedOutputPath(true);
                    setTimeout(() => setCopiedOutputPath(false), 2000);
                  }}
                  className="h-5 px-1.5 text-[10px] text-primary hover:bg-primary/10 gap-1 font-semibold"
                >
                  {copiedOutputPath ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedOutputPath ? "Copied Path" : "Copy Path"}
                </Button>
              </div>
              <p className="font-mono text-[11px] text-foreground/80 break-all bg-background/60 p-1.5 rounded border border-border/40">
                {result.outputDir}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Slide Files
              </span>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                {result.slides.map((s, idx) => (
                  <div
                    key={s.filename}
                    className="text-xs flex items-center justify-between p-2 rounded-md bg-card border border-border/40 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="secondary" className="text-[9px] font-mono shrink-0 px-1.5 py-0 bg-primary/10 text-primary border border-primary/20">
                        {idx === 0 ? "Cover" : `Slide ${String(idx).padStart(2, "0")}`}
                      </Badge>
                      <span className="font-mono text-[11px] text-foreground truncate">{s.filename}</span>
                    </div>
                    {s.error ? (
                      <Badge variant="destructive" className="text-[9px]">Failed</Badge>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" /> Ready
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FramePanel>
        </Frame>
      )}

      {/* Error Card */}
      {status === "error" && (
        <Card className="bg-[#ff5a6e10] border-[#ff5a6e40]">
          <CardContent className="p-4 text-xs text-[#ff5a6e]">
            ✗ {errorMsg}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
