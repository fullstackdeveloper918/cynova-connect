import { Video } from "lucide-react";
import { useEffect, useRef } from "react";

interface PreviewUrls {
  videoUrl: string;
  audioUrl: string;
}

interface VideoPreviewProps {
  script: string;
  previewUrl: PreviewUrls | null;
  selectedVoice: string;
}

export const VideoPreview = ({
  script,
  previewUrl,
  selectedVoice,
}: VideoPreviewProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Reset audio when preview URL changes
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [previewUrl]);

  if (!script) {
    return (
      <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2 text-muted-foreground">
          <Video className="mx-auto h-12 w-12" />
          <p>Generate a script to preview your video</p>
        </div>
      </div>
    );
  }

  const handleImageClick = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="w-full aspect-video rounded-lg bg-gray-50 overflow-hidden relative cursor-pointer group" onClick={handleImageClick}>
          <img 
            src={previewUrl.videoUrl} 
            alt="Video preview frame"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
          <audio
            ref={audioRef}
            src={previewUrl.audioUrl}
            className="hidden"
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
            Click to play/pause audio
          </div>
        </div>
      ) : (
        <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-2 text-muted-foreground">
            <Video className="mx-auto h-12 w-12 animate-pulse" />
            <p>Click preview to generate your video</p>
          </div>
        </div>
      )}
    </div>
  );
};