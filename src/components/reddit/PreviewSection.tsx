import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResolution } from "./ResolutionSelector";
import { RedditPost } from "./RedditPost";

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
        <div className="flex justify-center">
          <div 
            className="relative bg-black rounded-lg overflow-hidden"
            style={{
              aspectRatio: currentStyle.aspectRatio,
              maxHeight: currentStyle.maxHeight,
              width: currentStyle.width,
            }}
          >
            {/* Question Section (Top 2/3) */}
            <div className="absolute inset-x-0 top-0 h-2/3 bg-[#1A1A1B] overflow-hidden">
              {content && (
                <div className="p-4">
                  <div className="max-w-2xl mx-auto">
                    {title && <RedditPost title={title} darkMode />}
                  </div>
                </div>
              )}
              
              {/* Subtitles Overlay */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="bg-black/60 text-white p-2 mx-4 rounded text-lg">
                  {comments[0] || "Subtitles will appear here"}
                </div>
              </div>
            </div>

            {/* Background Video Section (Bottom 1/3) */}
            <div className="absolute inset-x-0 bottom-0 h-1/3">
              {previewUrl ? (
                <video
                  src={previewUrl}
                  autoPlay
                  loop
                  muted
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
          {selectedResolution === "youtube" ? "1920x1080" : "1080x1920"}
        </div>
      </CardContent>
    </Card>
  );
};