import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResolution } from "./ResolutionSelector";
import { CaptionStyle } from "./CaptionStyles";
import { useRef } from "react";
import { VideoContent } from "./VideoContent";
import { ContentOverlay } from "./ContentOverlay";

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
  const comments = contentLines.slice(1).join('\n\n');

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
                <VideoContent previewUrl={previewUrl} audioUrl={audioUrl} />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white/50">
                  Background video will appear here
                </div>
              )}
            </div>

            {/* Content Overlay */}
            {content && (
              <ContentOverlay
                title={title}
                comments={comments}
                audioRef={audioRef}
                captionStyle={getCaptionStyle()}
              />
            )}

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