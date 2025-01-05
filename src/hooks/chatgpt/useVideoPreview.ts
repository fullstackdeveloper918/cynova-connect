import { useState, useEffect } from "react";

export const useVideoPreview = () => {
  const [previewFrames, setPreviewFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && previewFrames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= previewFrames.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / 30); // 30 fps
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, previewFrames.length]);

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