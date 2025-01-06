import { VideoPreview } from "../chatgpt/VideoPreview";
import { Card } from "@/components/ui/card";

interface VideoPreviewSectionProps {
  previewUrls: Array<{ audioUrl: string; videoUrl?: string } | null>;
  scripts: string[];
  selectedQuestionIndex: number;
  selectedVoice: string;
}

export const VideoPreviewSection = ({
  previewUrls,
  scripts,
  selectedQuestionIndex,
  selectedVoice,
}: VideoPreviewSectionProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <div className="aspect-[9/16] w-full max-w-[450px] mx-auto">
          {previewUrls[selectedQuestionIndex] ? (
            <VideoPreview
              script={scripts[selectedQuestionIndex]}
              previewUrl={previewUrls[selectedQuestionIndex]}
              selectedVoice={selectedVoice}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Video preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};