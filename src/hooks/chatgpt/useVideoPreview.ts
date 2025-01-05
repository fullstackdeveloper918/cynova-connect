import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVideoPreview = () => {
  const [previewFrames, setPreviewFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPreview = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  return {
    previewFrames,
    currentFrame,
    setCurrentFrame,
    isPlaying,
    togglePlayback,
    resetPreview,
  };
};