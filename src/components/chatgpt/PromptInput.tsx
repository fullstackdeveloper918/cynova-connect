import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wand2, Loader2 } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  progress: number;
}

export const PromptInput = ({
  value,
  onChange,
  onGenerate,
  isGenerating,
  progress,
}: PromptInputProps) => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Describe the video you want to create..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-32"
      />
      <Button
        onClick={onGenerate}
        disabled={isGenerating || !value}
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
            Generate Script
          </>
        )}
      </Button>
      {isGenerating && <Progress value={progress} />}
    </div>
  );
};