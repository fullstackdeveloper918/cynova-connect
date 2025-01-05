import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResolution } from "./ResolutionSelector";

interface PreviewSectionProps {
  content: string;
  selectedResolution: VideoResolution;
  previewUrl: string;
}

export const PreviewSection = ({ content, selectedResolution, previewUrl }: PreviewSectionProps) => {
  // Define aspect ratios and max heights for different resolutions
  const resolutionStyles = {
    youtube: {
      aspectRatio: "16/9",
      maxHeight: "500px",
    },
    shorts: {
      aspectRatio: "9/16",
      maxHeight: "600px",
    },
    tiktok: {
      aspectRatio: "9/16",
      maxHeight: "600px",
    },
  };

  const currentStyle = resolutionStyles[selectedResolution];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          Preview your video with {selectedResolution.toUpperCase()} resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Preview */}
        {content && (
          <div className="rounded-lg bg-accent/20 p-4">
            <h3 className="font-semibold mb-2">Content Preview:</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
          </div>
        )}

        {/* Video Preview Container */}
        <div 
          className="relative w-full bg-black rounded-lg overflow-hidden mx-auto"
          style={{
            aspectRatio: currentStyle.aspectRatio,
            maxHeight: currentStyle.maxHeight,
          }}
        >
          {previewUrl ? (
            <video
              src={previewUrl}
              controls
              className="absolute inset-0 w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              Video preview will appear here
            </div>
          )}
        </div>

        {/* Resolution Info */}
        <div className="text-sm text-muted-foreground text-center">
          {selectedResolution === "youtube" ? "1920x1080" : "1080x1920"}
        </div>
      </CardContent>
    </Card>
  );
};