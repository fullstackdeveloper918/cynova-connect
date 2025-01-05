import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResolution } from "./ResolutionSelector";
import { CaptionStyle } from "./CaptionStyles";
import { useRef, useState } from "react";
import { VideoContent } from "./VideoContent";
import { ContentOverlay } from "./ContentOverlay";
import { Button } from "../ui/button";
import { ExternalLink } from "lucide-react";
import { BackgroundSelector } from "./BackgroundSelector";

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
  const [selectedBackground, setSelectedBackground] = useState("/stock/minecraft-gameplay.mp4");

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
        return "bg-black/60 text-white px-3 py-2 rounded-md text-lg font-medium shadow-lg";
      case "subtitles":
        return "bg-black/80 text-white px-4 py-3 rounded-lg text-xl font-semibold shadow-xl";
      case "captions":
        return "bg-black/90 text-white px-5 py-4 rounded-xl text-2xl font-bold shadow-2xl";
      case "elevenlabs-default":
        return "bg-black/75 text-white px-4 py-3 rounded-lg text-xl font-medium leading-relaxed tracking-wide shadow-xl border border-white/10";
      case "elevenlabs-clean":
        return "bg-gradient-to-b from-black/80 to-black/60 text-white px-5 py-3 rounded-xl text-xl font-medium tracking-wide shadow-lg backdrop-blur-sm";
      case "elevenlabs-overlay":
        return "bg-gradient-to-r from-purple-900/80 via-purple-800/70 to-purple-900/80 text-white px-6 py-4 rounded-2xl text-xl font-semibold tracking-wide shadow-2xl border border-purple-500/20";
      default:
        return "bg-black/80 text-white px-4 py-3 rounded-lg text-xl shadow-lg";
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
      <CardContent className="space-y-8">
        <BackgroundSelector
          selected={selectedBackground}
          onSelect={setSelectedBackground}
        />

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
              <VideoContent 
                previewUrl={selectedBackground} 
                audioUrl={audioUrl}
                audioRef={audioRef}
              />
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
            {!content && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Content and video preview will appear here
              </div>
            )}
          </div>
        </div>

        {/* Preview Links */}
        {(previewUrl || audioUrl) && (
          <div className="space-y-2 p-4 bg-accent/20 rounded-lg">
            <h3 className="font-medium mb-2">Generated Files:</h3>
            {previewUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Video URL:</span>
                <Button variant="link" size="sm" onClick={() => window.open(previewUrl, '_blank')}>
                  View Video <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
            {audioUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Audio URL:</span>
                <Button variant="link" size="sm" onClick={() => window.open(audioUrl, '_blank')}>
                  View Audio <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Resolution Info */}
        <div className="text-sm text-muted-foreground text-center">
          1080x1920
        </div>
      </CardContent>
    </Card>
  );
};
