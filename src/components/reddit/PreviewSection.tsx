import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResolution } from "./ResolutionSelector";
import { CaptionStyle } from "./CaptionStyles";
import { useRef, useState } from "react";
import { VideoContent } from "./VideoContent";
import { ContentOverlay } from "./ContentOverlay";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { BackgroundSelector } from "./BackgroundSelector";
import { useToast } from "@/hooks/use-toast";

interface PreviewSectionProps {
  content: string;
  selectedResolution: VideoResolution;
  selectedCaptionStyle: CaptionStyle;
  previewUrl: string;
  titleAudioUrl?: string;
  commentAudioUrl?: string;
  onExport: () => void;
  animateCaptions: boolean;
}

export const PreviewSection = ({ 
  content, 
  selectedResolution, 
  selectedCaptionStyle,
  previewUrl,
  titleAudioUrl,
  commentAudioUrl,
  onExport,
  animateCaptions
}: PreviewSectionProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedBackground, setSelectedBackground] = useState("/stock/minecraft-gameplay.mp4");
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();

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

  const handleDownload = async () => {
    try {
      if (!previewUrl) {
        toast({
          title: "No video available",
          description: "Please generate a video first.",
          variant: "destructive",
        });
        return;
      }

      // Start download toast
      toast({
        title: "Starting download",
        description: "Preparing your video...",
      });

      // Fetch the video as an array buffer to preserve binary data
      const response = await fetch(previewUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const arrayBuffer = await response.arrayBuffer();
      const videoBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
      const url = window.URL.createObjectURL(videoBlob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      // Clean filename and ensure .mp4 extension
      const cleanTitle = title
        .slice(0, 30)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      link.download = `${cleanTitle}_video.mp4`;
      
      // Append link, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download complete",
        description: "Your video has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCaptionStyle = () => {
    switch (selectedCaptionStyle) {
      case "minimal":
        return "bg-black/60 text-white px-3 py-2 rounded-md text-lg font-medium shadow-lg";
      case "subtitles":
        return "bg-black/80 text-white px-4 py-3 rounded-lg text-xl font-semibold shadow-xl";
      case "captions":
        return "bg-black/90 text-white px-5 py-4 rounded-xl text-2xl font-bold shadow-2xl";
      case "assembly-default":
        return "bg-black/75 text-white px-4 py-3 rounded-lg text-xl font-medium leading-relaxed tracking-wide shadow-xl border border-white/10";
      case "assembly-clean":
        return "bg-gradient-to-b from-black/80 to-black/60 text-white px-5 py-3 rounded-xl text-xl font-medium tracking-wide shadow-lg backdrop-blur-sm";
      case "assembly-overlay":
        return "bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-900/80 text-white px-6 py-4 rounded-2xl text-xl font-semibold tracking-wide shadow-2xl border border-blue-500/20";
      default:
        return "bg-black/80 text-white px-4 py-3 rounded-lg text-xl shadow-lg";
    }
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
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
                titleAudioUrl={titleAudioUrl}
                commentAudioUrl={commentAudioUrl}
                audioRef={audioRef}
                onDurationChange={handleDurationChange}
                captionStyle={selectedCaptionStyle}
                animateCaptions={animateCaptions}
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

        {/* Download Button */}
        {previewUrl && (
          <div className="flex justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={handleDownload}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          </div>
        )}

        {/* Resolution and Duration Info */}
        <div className="text-sm text-muted-foreground text-center space-y-1">
          <div>1080x1920</div>
          <div>{Math.round(duration)} seconds</div>
        </div>
      </CardContent>
    </Card>
  );
};
