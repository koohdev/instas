import { useAppStore, GenerateResult } from "@/lib/store";

export type { GenerateResult };

export function useGeneration() {
  const store = useAppStore();

  return {
    status: store.generationStatus,
    result: store.generationResult,
    errorMsg: store.generationErrorMsg,
    progress: store.generationProgress,
    statusMessage: store.generationStatusMessage,
    handleGenerate: store.handleGenerate,
    resetGeneration: store.resetGeneration,
  };
}
