import { Video } from "lucide-react";
import { useEffect, useRef } from "react";

interface FrameDisplayProps {
  isLoading: boolean;
  frameUrls: string[];
  currentFrameIndex: number;
  currentCaption: string;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  onClick: () => void;
}

export const FrameDisplay = ({
  isLoading,
  frameUrls,
  currentFrameIndex,
  currentCaption,
  isPlaying,
  audioRef,
  currentTime,
  onClick,
}: FrameDisplayProps) => {
  const imageRefs = useRef<HTMLImageElement[]>([]);

  // Preload images
  useEffect(() => {
    frameUrls.forEach((url, index) => {
      const img = new Image();
      img.src = url;
      imageRefs.current[index] = img;
    });
  }, [frameUrls]);

  if (!frameUrls.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-muted-foreground">Generating frames...</p>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {frameUrls.map((url, index) => (
            <img
              key={`${index}-${currentFrameIndex === index}`}
              src={url}
              alt={`Frame ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                currentFrameIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ zIndex: currentFrameIndex === index ? 1 : 0 }}
            />
          ))}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 flex items-center justify-center">
        <div className="text-white text-lg p-6 text-center max-w-lg">
          {currentCaption}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
        {isPlaying ? 'Click to pause' : 'Click to play'}
      </div>
      {audioRef.current && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ 
              width: `${(currentTime / audioRef.current.duration) * 100}%` 
            }}
          />
        </div>
      )}
    </>
  );
};