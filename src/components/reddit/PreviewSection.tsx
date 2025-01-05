import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResolution } from "./ResolutionSelector";
import { RedditPost } from "./RedditPost";
import { RedditComment } from "./RedditComment";

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
      width: "100%",
    },
    shorts: {
      aspectRatio: "9/16",
      maxHeight: "800px",
      width: "450px", // This ensures proper mobile aspect ratio
    },
    tiktok: {
      aspectRatio: "9/16",
      maxHeight: "800px",
      width: "450px", // This ensures proper mobile aspect ratio
    },
  };

  const currentStyle = resolutionStyles[selectedResolution];

  // Split content into title and comments
  const contentLines = content.split('\n\n').filter(Boolean);
  const title = contentLines[0];
  const comments = contentLines.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          Preview your video with {selectedResolution.toUpperCase()} resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Preview Container */}
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
            {previewUrl && (
              <video
                src={previewUrl}
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            )}

            {/* Content Overlay */}
            {content && (
              <div className="absolute inset-0 flex flex-col">
                {/* Reddit Content */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-black/60 to-transparent p-4">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {title && <RedditPost title={title} />}
                    <div className="space-y-2">
                      {comments.slice(0, 5).map((comment, index) => (
                        <RedditComment key={index} content={comment} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Bottom Gradient Overlay */}
                <div className="h-24 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            {/* Placeholder when no content */}
            {!previewUrl && !content && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Video preview will appear here
              </div>
            )}
          </div>
        </div>

        {/* Resolution Info */}
        <div className="text-sm text-muted-foreground text-center">
          {selectedResolution === "youtube" ? "1920x1080" : "1080x1920"}
        </div>
      </CardContent>
    </Card>
  );
};