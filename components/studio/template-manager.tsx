import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

interface TemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateManager({ open, onOpenChange }: TemplateManagerProps) {
  const store = useAppStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return;

    await store.addTemplate({
      id: `tpl_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      ...store.settings
    });
    
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Design Template</DialogTitle>
          <DialogDescription>
            This saves your entire current configuration (visuals, cover text, layout, branding, and backgrounds) into a single reusable template.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-1.5 sm:gap-4">
            <Label htmlFor="template-name" className="text-left sm:text-right text-xs font-semibold">Name</Label>
            <Input
              id="template-name"
              placeholder="e.g. Master Dark Theme"
              className="col-span-3 text-base sm:text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-1.5 sm:gap-4">
            <Label htmlFor="template-desc" className="text-left sm:text-right text-xs font-semibold">Description</Label>
            <Input
              id="template-desc"
              placeholder="e.g. Used for weekly curated lists"
              className="col-span-3 text-base sm:text-xs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-xs font-semibold">Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim()} className="w-full sm:w-auto text-xs font-semibold">Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
