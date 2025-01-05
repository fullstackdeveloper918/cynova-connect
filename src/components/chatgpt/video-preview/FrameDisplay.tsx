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
        <img
          key={currentFrameIndex} // Add key to force re-render
          src={frameUrls[currentFrameIndex]}
          alt={`Frame ${currentFrameIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
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