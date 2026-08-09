import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Image as ImageIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface BackgroundSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFilename?: string;
  onSelect: (filename: string) => void;
}

export function BackgroundSelectorModal({ open, onOpenChange, selectedFilename, onSelect }: BackgroundSelectorModalProps) {
  const store = useAppStore();

  const handleChoose = (filename: string) => {
    onSelect(filename);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b border-border/40 shrink-0">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
            <ImageIcon className="w-5 h-5 text-primary shrink-0" /> Select Custom Background Image
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Browse and select from your custom background library ({store.backgroundList.length} images available).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-3">
          {store.backgroundList.length === 0 ? (
            <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center bg-card h-full">
              <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
              <h5 className="text-sm font-bold text-foreground">No custom background images found</h5>
              <p className="text-xs text-muted-foreground">Upload images via the Custom Backgrounds library tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 max-h-[72vh] overflow-y-auto pr-1 p-1">
              {store.backgroundList.map((bg) => {
                const isSelected = selectedFilename === bg.filename;
                return (
                  <div
                    key={bg.id}
                    onClick={() => handleChoose(bg.filename)}
                    className={`group relative flex flex-col rounded-xl border-2 overflow-hidden cursor-pointer transition-all active:scale-[0.98] ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 shadow-2xl scale-[1.01] bg-primary/10"
                        : "border-border/80 hover:border-primary/60 hover:shadow-lg bg-card"
                    }`}
                  >
                    {/* Generous Image Picture Container */}
                    <div className="relative h-44 sm:h-48 w-full bg-neutral-950 overflow-hidden rounded-t-xl flex items-center justify-center">
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                      />
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Background
                        </div>
                      )}
                    </div>

                    {/* Card Footer Label */}
                    <div className="p-3.5 bg-card flex flex-col border-t border-border/40">
                      <span className="text-xs font-bold text-foreground truncate leading-tight">{bg.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{bg.filename}</span>
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
