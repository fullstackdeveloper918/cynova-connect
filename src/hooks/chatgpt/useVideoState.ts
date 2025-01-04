import { useState } from "react";

interface PreviewUrls {
  videoUrl: string;
  audioUrl: string;
}

export const useVideoState = () => {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<PreviewUrls | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("Sarah");
  const [selectedDuration, setSelectedDuration] = useState("48");
  const [progress, setProgress] = useState(0);

  return {
    prompt,
    setPrompt,
    script,
    setScript,
    isGenerating,
    setIsGenerating,
    isPreviewLoading,
    setIsPreviewLoading,
    previewUrl,
    setPreviewUrl,
    selectedVoice,
    setSelectedVoice,
    selectedDuration,
    setSelectedDuration,
    progress,
    setProgress,
  };
};