import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  progress: number;
  onGenerate: () => void;
}

export const PromptInput = ({
  prompt,
  setPrompt,
  isGenerating,
  progress,
  onGenerate,
}: PromptInputProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">1. Describe Your Video</h2>
      <Textarea
        placeholder="Describe the video you want to create..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="h-32"
      />
      <Button
        onClick={onGenerate}
        disabled={isGenerating || !prompt}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Video
          </>
        )}
      </Button>
      {isGenerating && <Progress value={progress} />}
    </div>
  );
};