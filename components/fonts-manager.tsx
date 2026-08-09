"use client";

import { useState, useRef } from "react";
import { Type, Upload, Search, Check, RefreshCcw, Layers, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useAppStore } from "@/lib/store";

interface FontsManagerProps {
  onSelectFont?: (family: string) => void;
}

export function FontsManager({ onSelectFont }: FontsManagerProps) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [specimenText, setSpecimenText] = useState("Stop making your own components");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Group stored fonts by family
  const familyMap: Record<
    string,
    { family: string; formats: string[]; totalSize: number; filesCount: number; sampleUrl: string }
  > = {};

  const defaultFamilies = ["Inter", "Roboto", "Outfit", "Plus Jakarta Sans", "Cabinet Grotesk"];
  for (const name of defaultFamilies) {
    familyMap[name] = { family: name, formats: ["system"], totalSize: 0, filesCount: 1, sampleUrl: "" };
  }

  for (const font of store.fontList) {
    if (!familyMap[font.family]) {
      familyMap[font.family] = {
        family: font.family,
        formats: [font.format],
        totalSize: font.sizeBytes,
        filesCount: 1,
        sampleUrl: font.url,
      };
    } else {
      familyMap[font.family].totalSize += font.sizeBytes;
      familyMap[font.family].filesCount += 1;
      if (!familyMap[font.family].formats.includes(font.format)) {
        familyMap[font.family].formats.push(font.format);
      }
    }
  }

  const families = Object.values(familyMap).filter((f) =>
    f.family.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);
        await fetch("/api/fonts", {
          method: "POST",
          body: data,
        });
      }
      await store.fetchData();
    } catch {
      // quiet handle
    } finally {
      setIsUploading(false);
    }
  };

  const handleApply = (family: string) => {
    store.updateSetting("fontFamily", family);
    if (onSelectFont) {
      onSelectFont(family);
    }
    store.setActiveTab("studio");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "System";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h3 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" /> Custom Fonts Library
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage custom typography stored in <code className="text-primary font-mono">fonts/</code> folder. Live <code className="text-primary font-mono">@font-face</code> rendering across all covers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".ttf,.otf,.woff,.woff2,.eot"
            className="hidden"
            onChange={handleFileUpload}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold"
          >
            <Upload className="w-4 h-4" /> {isUploading ? "Uploading Fonts..." : "Upload Font Files / Folder"}
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search font families..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Specimen Preview:</span>
          <Input
            value={specimenText}
            onChange={(e) => setSpecimenText(e.target.value)}
            placeholder="Type sample text..."
            className="text-xs h-9 bg-card"
          />
        </div>
      </div>

      {/* Grid of Font Families */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {families.map((item) => {
          const isSelected = store.settings.fontFamily === item.family;
          return (
            <Frame
              key={item.family}
              variant="default"
              spacing="default"
              className={`transition-all hover:border-primary/50 ${
                isSelected ? "border-primary ring-2 ring-primary/30 shadow-lg" : ""
              }`}
            >
              <FramePanel className="gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-foreground">{item.family}</h4>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                      {item.formats.join(", ")}
                    </Badge>
                  </div>
                  {isSelected && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Active in Studio
                    </Badge>
                  )}
                </div>

                {/* Live Font Specimen Card */}
                <div className="p-4 rounded-xl border border-border/40 bg-card/60 flex flex-col gap-2 min-h-[110px] justify-center">
                  <span
                    className="text-xl font-bold text-foreground truncate"
                    style={{ fontFamily: `'${item.family}', sans-serif` }}
                  >
                    {specimenText || "Stop making your own components"}
                  </span>
                  <span
                    className="text-xs text-muted-foreground truncate"
                    style={{ fontFamily: `'${item.family}', sans-serif` }}
                  >
                    The quick brown fox jumps over the lazy dog 1234567890
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {item.filesCount} file{item.filesCount !== 1 ? "s" : ""} • {formatFileSize(item.totalSize)}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => handleApply(item.family)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" /> Use in Studio
                  </Button>
                </div>
              </FramePanel>
            </Frame>
          );
        })}
      </div>
    </div>
  );
}
