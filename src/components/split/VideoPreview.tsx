import { useRef, useEffect } from "react";

interface VideoPreviewProps {
  file: File;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}

export const VideoPreview = ({ file, onTimeUpdate, onDurationChange }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => onDurationChange(e.currentTarget.duration)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};