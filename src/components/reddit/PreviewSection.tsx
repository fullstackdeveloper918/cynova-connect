import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResolution } from "./ResolutionSelector";
import { RedditPost } from "./RedditPost";
import { CaptionStyle } from "./CaptionStyles";
import { TimedCaptions } from "./TimedCaptions";
import { useEffect, useRef } from "react";

interface PreviewSectionProps {
  content: string;
  selectedResolution: VideoResolution;
  selectedCaptionStyle: CaptionStyle;
  previewUrl: string;
  audioUrl?: string;
  onExport: () => void;
}

export const PreviewSection = ({ 
  content, 
  selectedResolution, 
  selectedCaptionStyle,
  previewUrl,
  audioUrl,
  onExport
}: PreviewSectionProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && audioRef.current && previewUrl) {
      // Start playing both video and audio when they're loaded
      const playMedia = () => {
        videoRef.current?.play();
        audioRef.current?.play();
      };

      videoRef.current.addEventListener('loadeddata', playMedia);
      return () => {
        videoRef.current?.removeEventListener('loadeddata', playMedia);
      };
    }
  }, [previewUrl, audioUrl]);

  const resolutionStyles = {
    shorts: {
      aspectRatio: "9/16",
      maxHeight: "800px",
      width: "450px",
    },
    tiktok: {
      aspectRatio: "9/16",
      maxHeight: "800px",
      width: "450px",
    },
  };

  const currentStyle = resolutionStyles[selectedResolution];

  // Split content into title and comments
  const contentLines = content.split('\n\n').filter(Boolean);
  const title = contentLines[0];
  const comments = contentLines.slice(1).join(" ");

  const getCaptionStyle = () => {
    switch (selectedCaptionStyle) {
      case "minimal":
        return "bg-black/60 text-white px-3 py-2 rounded-md text-lg";
      case "subtitles":
        return "bg-black/80 text-white px-4 py-3 rounded-lg text-xl font-medium";
      case "captions":
        return "bg-black/90 text-white px-5 py-4 rounded-xl text-2xl font-semibold";
      default:
        return "bg-black/80 text-white px-4 py-3 rounded-lg text-lg";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          Preview your video with {selectedResolution.toUpperCase()} resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div 
            className="relative bg-black rounded-lg overflow-hidden"
            style={{
              aspectRatio: currentStyle.aspectRatio,
              maxHeight: currentStyle.maxHeight,
              width: currentStyle.width,
            }}
          >
            {/* Background Video */}
            <div className="absolute inset-0">
              {previewUrl ? (
                <video
                  ref={videoRef}
                  src={previewUrl}
                  loop
                  muted={!audioUrl}
                  playsInline
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white/50">
                  Background video will appear here
                </div>
              )}
            </div>

            {/* Audio Element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                className="hidden"
              />
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-black/40">
              {/* Title Section */}
              {content && (
                <div className="p-4">
                  <div className="max-w-2xl mx-auto">
                    {title && <RedditPost title={title} darkMode />}
                  </div>
                </div>
              )}
              
              {/* Timed Captions */}
              {audioUrl && comments && (
                <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                  <TimedCaptions
                    captions={comments}
                    audioRef={audioRef}
                    className={getCaptionStyle()}
                  />
                </div>
              )}
            </div>

            {/* Placeholder when no content */}
            {!content && !previewUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Content and video preview will appear here
              </div>
            )}
          </div>
        </div>

        {/* Resolution Info */}
        <div className="text-sm text-muted-foreground text-center">
          1080x1920
        </div>
      </CardContent>
    </Card>
  );
};