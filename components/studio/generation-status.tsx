"use client";

import { useState } from "react";
import { Wand2, Play, CheckCheck, Folder, Check, Copy, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useGeneration } from "@/hooks/useGeneration";
import { useAppStore } from "@/lib/store";

const STEPS = [
  { label: "Scraping URLs", threshold: 0 },
  { label: "Compositing Slides", threshold: 25 },
  { label: "Applying Overlays", threshold: 65 },
  { label: "Exporting PNG", threshold: 88 },
];

function getActiveStep(progress: number): number {
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (progress >= STEPS[i].threshold) return i;
  }
  return 0;
}

export function GenerationStatus() {
  const store = useAppStore();
  const { status, result, errorMsg, progress, statusMessage, handleGenerate } = useGeneration();
  const [copiedOutputPath, setCopiedOutputPath] = useState(false);

  const urlList = store.urls.split("\n").map(u => u.trim()).filter(Boolean);

  const onGenerateClick = () => {
    handleGenerate(urlList);
  };

  const activeStep = getActiveStep(progress);

  if (status !== "error" || !errorMsg) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-[#ff5a6e10] border-[#ff5a6e40]">
        <CardContent className="p-4 text-xs text-[#ff5a6e]">
          ✗ {errorMsg}
        </CardContent>
      </Card>
    </div>
  );
}
