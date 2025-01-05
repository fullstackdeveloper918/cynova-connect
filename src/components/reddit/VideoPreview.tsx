import { useEffect, useRef } from "react";

interface VideoPreviewProps {
  url: string;
  content: string;
}

export const VideoPreview = ({ url, content }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [url]);

  if (!url && !content) return null;

  return (
    <div className="space-y-4">
      {content && (
        <div className="rounded-lg bg-accent/20 p-4">
          <h3 className="font-semibold mb-2">Content Preview:</h3>
          <p className="text-muted-foreground">{content}</p>
        </div>
      )}
      {url && (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            controls
            className="w-full h-full object-contain"
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};