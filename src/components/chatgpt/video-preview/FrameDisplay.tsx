import { Video } from "lucide-react";

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
          {/* Main video frame */}
          <div className="absolute inset-0">
            {frameUrls[currentFrameIndex] && (
              <img
                src={frameUrls[currentFrameIndex]}
                alt="Video frame"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Caption overlay */}
          <div className="absolute bottom-16 left-0 right-0 p-4">
            <div className="bg-black/50 text-white p-3 rounded-lg text-center mx-auto max-w-[80%]">
              {currentCaption}
            </div>
          </div>
          
          {/* Controls overlay */}
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