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

  // Split the caption into option A and option B
  const options = currentCaption.split(" OR ");
  const optionA = options[0]?.replace("Would you rather ", "");
  const optionB = options[1]?.replace("?", "");

  return (
    <>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Split background with red top and blue bottom */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-[#ea384c] flex flex-col items-center justify-center p-4 space-y-4">
              <div className="text-white text-xl font-medium text-center max-w-lg">
                {optionA}
              </div>
              {/* Small image container for option A */}
              <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                {frameUrls[currentFrameIndex] && (
                  <img
                    src={frameUrls[currentFrameIndex]}
                    alt="Option A visualization"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                )}
              </div>
            </div>
            <div className="flex-1 bg-[#0EA5E9] flex flex-col items-center justify-center p-4 space-y-4">
              <div className="text-white text-xl font-medium text-center max-w-lg">
                {optionB}
              </div>
              {/* Small image container for option B */}
              <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                {frameUrls[currentFrameIndex] && (
                  <img
                    src={frameUrls[currentFrameIndex]}
                    alt="Option B visualization"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Controls overlay with highest z-index */}
          <div 
            className="absolute inset-0 flex flex-col justify-end p-4"
            style={{ zIndex: 3 }}
          >
            <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full w-fit mb-4">
              {isPlaying ? 'Click to pause' : 'Click to play'}
            </div>
            
            {audioRef.current && (
              <div className="w-full h-1 bg-gray-200/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100"
                  style={{ 
                    width: `${(currentTime / audioRef.current.duration) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};