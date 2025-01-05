import { Button } from "@/components/ui/button";
import { Play, Save, Loader2 } from "lucide-react";

interface PreviewControlsProps {
  script: string;
  previewUrl: { videoUrl: string; audioUrl: string; } | null;
  onPreview: () => void;
  onExport: () => void;
  isPreviewLoading: boolean;
}

export const PreviewControls = ({
  script,
  previewUrl,
  onPreview,
  onExport,
  isPreviewLoading,
}: PreviewControlsProps) => {
  if (!script) return null;

  return (
    <div className="flex gap-4">
      <Button 
        className="flex-1" 
        onClick={onPreview}
        disabled={isPreviewLoading}
      >
        {isPreviewLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Preview
          </>
        )}
      </Button>
      <Button 
        variant="secondary" 
        className="flex-1" 
        onClick={onExport}
        disabled={!previewUrl}
      >
        <Save className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
};