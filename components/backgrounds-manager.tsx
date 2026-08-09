import { useState, useRef, useEffect } from "react";
import { Upload, Trash2, Check, Image as ImageIcon, Sparkles, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useAppStore } from "@/lib/store";

interface BackgroundsManagerProps {
  activeBackground?: string;
  onSelectBackground?: (filename: string) => void;
}

export function BackgroundsManager({ activeBackground, onSelectBackground }: BackgroundsManagerProps) {
  const store = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    store.fetchData();
  }, []);

  const handleFileUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/backgrounds", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        await store.fetchData();
      }
    } catch {
      // quiet fail
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(`/api/backgrounds?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await store.fetchData();
      }
    } catch {
      // quiet fail
    }
  };

  const filteredBackgrounds = store.backgroundList.filter((bg) =>
    bg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bg.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h3 className="text-xl font-bold font-heading flex items-center gap-2 text-foreground">
            <ImageIcon className="w-5 h-5 text-primary" /> Custom Background Library
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload, preview, and manage custom background image assets for your carousel generator.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search backgrounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-muted/20"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold h-9 shrink-0"
          >
            <Upload className="w-4 h-4" /> {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]"
            : "border-border/60 bg-card hover:border-primary/50 hover:bg-muted/10"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">Drag & drop background images here</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supports PNG, JPG, WEBP, GIF, SVG up to 10MB
          </p>
        </div>
      </div>

      {/* Visual Background Picture Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
            Uploaded Background Assets ({filteredBackgrounds.length})
          </h4>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
            {store.backgroundList.length} total stored
          </Badge>
        </div>

        {filteredBackgrounds.length === 0 ? (
          <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center bg-card">
            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
            <h5 className="text-sm font-bold text-foreground">No background images found</h5>
            <p className="text-xs text-muted-foreground">Upload your first custom background picture above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBackgrounds.map((bg) => {
              const isSelected = activeBackground === bg.filename || store.settings.customBgImage === bg.filename;
              return (
                <Frame
                  key={bg.id}
                  variant="default"
                  spacing="default"
                  className={`overflow-hidden transition-all group ${
                    isSelected ? "border-primary ring-2 ring-primary/30 shadow-lg" : "hover:border-primary/50"
                  }`}
                >
                  <FramePanel className="p-0 gap-0 overflow-hidden rounded-t-xl">
                    {/* Visual Image Picture Preview */}
                    <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden rounded-t-xl">
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      {isSelected && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] gap-1 shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </Badge>
                      )}
                    </div>

                    {/* Meta Footer & Action Buttons */}
                    <div className="p-3.5 flex flex-col gap-3 bg-card">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground truncate">{bg.name}</span>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-0.5">
                          <span className="truncate max-w-[140px]">{bg.filename}</span>
                          <span>{formatFileSize(bg.sizeBytes)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (onSelectBackground) {
                              onSelectBackground(bg.filename);
                            } else {
                              store.updateSetting("bgType", "custom");
                              store.updateSetting("customBgImage", bg.filename);
                              store.updateSetting("showBlurredBg", false);
                              store.setActiveTab("studio");
                            }
                          }}
                          className="flex-1 text-xs gap-1.5 h-8 font-semibold"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Use in Studio
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bg.filename)}
                          className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </FramePanel>
                </Frame>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
