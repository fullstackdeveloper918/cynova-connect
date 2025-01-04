import { Button } from "@/components/ui/button";
import { Play, Save, Loader2 } from "lucide-react";
import { VideoPreview } from "./VideoPreview";

interface PreviewSectionProps {
  script: string;
  previewUrl: string;
  selectedVoice: string;
  onPreview: () => Promise<void>;
  onExport: () => Promise<void>;
  isPreviewLoading: boolean;
}

export const PreviewSection = ({
  script,
  previewUrl,
  selectedVoice,
  onPreview,
  onExport,
  isPreviewLoading,
}: PreviewSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Preview</h2>
      <VideoPreview
        script={script}
        previewUrl={previewUrl}
        selectedVoice={selectedVoice}
      />
      {script && (
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
          <Button variant="secondary" className="flex-1" onClick={onExport}>
            <Save className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      )}
    </div>
  );
};