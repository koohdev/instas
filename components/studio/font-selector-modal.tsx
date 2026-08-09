import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Type, Search, Upload } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface FontSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFontFamily?: string;
  onSelect: (family: string) => void;
}

export function FontSelectorModal({
  open,
  onOpenChange,
  selectedFontFamily,
  onSelect,
}: FontSelectorModalProps) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Group fonts by family
  const familyMap: Record<string, { family: string; formats: string[]; sampleUrl: string }> = {};
  
  // Standard web safe fallbacks
  const defaultFamilies = ["Inter", "Roboto", "Outfit", "Plus Jakarta Sans", "Cabinet Grotesk"];
  for (const name of defaultFamilies) {
    familyMap[name] = { family: name, formats: ["system"], sampleUrl: "" };
  }

  for (const font of store.fontList) {
    if (!familyMap[font.family]) {
      familyMap[font.family] = {
        family: font.family,
        formats: [font.format],
        sampleUrl: font.url,
      };
    } else {
      if (!familyMap[font.family].formats.includes(font.format)) {
        familyMap[font.family].formats.push(font.format);
      }
    }
  }

  const families = Object.values(familyMap).filter((f) =>
    f.family.toLowerCase().includes(search.toLowerCase())
  );

  const handleChoose = (family: string) => {
    onSelect(family);
    onOpenChange(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/fonts", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const result = await res.json();
        if (result.font) {
          await store.fetchData();
          handleChoose(result.font.family);
        }
      }
    } catch {
      // quiet handle
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border/40 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <Type className="w-5 h-5 text-primary shrink-0" /> Select Typography & Custom Font Family
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Choose from stored custom fonts or upload new font files (TTF, OTF, WOFF2).
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/10 h-8 cursor-pointer active:scale-[0.97]"
            >
              <Upload className="w-3.5 h-3.5" /> {isUploading ? "Uploading..." : "Upload Font File"}
            </Button>
          </div>
        </DialogHeader>

        <div className="pt-3 pb-1 shrink-0">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search font families..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-base sm:text-xs h-9 bg-muted/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden py-2">
          {families.length === 0 ? (
            <div className="p-8 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center bg-card h-full">
              <Type className="w-10 h-10 text-muted-foreground/40" />
              <h5 className="text-sm font-bold text-foreground">No font families found</h5>
              <p className="text-xs text-muted-foreground">Upload font files above or check your search filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[62vh] overflow-y-auto pr-1 p-1">
              {families.map((item) => {
                const isSelected = selectedFontFamily === item.family;
                return (
                  <div
                    key={item.family}
                    onClick={() => handleChoose(item.family)}
                    className={`group relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 shadow-xl bg-primary/5"
                        : "border-border/80 hover:border-primary/60 hover:shadow-md bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{item.family}</span>
                        <Badge variant="outline" className="text-[9px] uppercase border-border font-mono shrink-0">
                          {item.formats.join(", ")}
                        </Badge>
                      </div>

                      {isSelected && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] gap-1 shadow-md shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </Badge>
                      )}
                    </div>

                    {/* Live Font Specimen Render Box */}
                    <div className="py-4 flex flex-col gap-1 min-h-[90px] justify-center">
                      <span
                        className="text-lg font-bold text-foreground truncate"
                        style={{ fontFamily: `'${item.family}', sans-serif` }}
                      >
                        Stop making components
                      </span>
                      <span
                        className="text-xs text-muted-foreground truncate"
                        style={{ fontFamily: `'${item.family}', sans-serif` }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                      <span>FAMILY SPECIMEN</span>
                      <span className="group-hover:text-primary transition-colors font-semibold">Select Font &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
