import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ContentInputProps {
  redditUrl: string;
  content: string;
  isGenerating: boolean;
  onUrlChange: (url: string) => void;
  onContentChange: (content: string) => void;
  onFetch: () => void;
}

export const ContentInput = ({
  redditUrl,
  content,
  isGenerating,
  onUrlChange,
  onContentChange,
  onFetch,
}: ContentInputProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>
          Enter a Reddit post URL or paste the content directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Reddit post URL"
            value={redditUrl}
            onChange={(e) => onUrlChange(e.target.value)}
          />
          <Button
            onClick={onFetch}
            disabled={isGenerating}
            variant="secondary"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Fetching...
              </>
            ) : (
              "Fetch"
            )}
          </Button>
        </div>
        <Textarea
          placeholder="Enter your content here..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[200px]"
        />
      </CardContent>
    </Card>
  );
};