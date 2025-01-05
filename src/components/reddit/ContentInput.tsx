import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SpeechToText } from "./SpeechToText";

interface ContentInputProps {
  redditUrl: string;
  content: string;
  isGenerating: boolean;
  onUrlChange: (url: string) => void;
  onContentChange: (content: string) => void;
  onFetch: () => void;
  onSpeechTranscript: (transcript: string) => void;
}

export const ContentInput = ({
  redditUrl,
  content,
  isGenerating,
  onUrlChange,
  onContentChange,
  onFetch,
  onSpeechTranscript,
}: ContentInputProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reddit Content</CardTitle>
        <CardDescription>
          Enter a Reddit post URL or paste your content directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Enter Reddit URL"
            value={redditUrl}
            onChange={(e) => onUrlChange(e.target.value)}
          />
          <Button
            onClick={onFetch}
            disabled={isGenerating}
            className="min-w-[100px]"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Fetch"
            )}
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Content</label>
            <SpeechToText onTranscript={onSpeechTranscript} />
          </div>
          <Textarea
            placeholder="Or paste your content here..."
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};