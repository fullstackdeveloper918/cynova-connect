import { Video } from "lucide-react";

interface VideoPreviewProps {
  script: string;
  previewUrl: string;
  selectedVoice: string;
}

export const VideoPreview = ({
  script,
  previewUrl,
  selectedVoice,
}: VideoPreviewProps) => {
  if (!script) {
    return (
      <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2 text-muted-foreground">
          <Video className="mx-auto h-12 w-12" />
          <p>Generate a script to preview your video</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <video
            key={previewUrl} // Force video reload when URL changes
            src={previewUrl}
            controls
            className="absolute inset-0 w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-2 text-muted-foreground">
            <Video className="mx-auto h-12 w-12" />
            <p>Click preview to generate your video</p>
          </div>
        </div>
      )}
    </div>
  );
};