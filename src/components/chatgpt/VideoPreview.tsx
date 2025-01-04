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
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="w-full aspect-video rounded-lg bg-gray-50 overflow-hidden relative">
          <img 
            src={previewUrl.videoUrl} 
            alt="Video preview frame"
            className="w-full h-full object-cover"
          />
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