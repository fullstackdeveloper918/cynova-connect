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
        {/* Content Preview */}
        {content && (
          <div className="rounded-lg bg-[#DAE0E6] p-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {title && <RedditPost title={title} />}
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <RedditComment key={index} content={comment} />
                ))}
              </div>
            </div>
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