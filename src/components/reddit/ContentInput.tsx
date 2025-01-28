import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ContentInputProps {
  redditUrl: string;
  content: string;
  isGenerating: boolean;
  selectedDuration: string;
  onUrlChange: (url: string) => void;
  onContentChange: (content: string) => void;
  onDurationChange: (duration: string) => void;
  onFetch: () => void;
}

export const ContentInput = ({
  redditUrl,
  content,
  isGenerating,
  selectedDuration,
  onUrlChange,
  onContentChange,
  onDurationChange,
  onFetch,
}: ContentInputProps) => {
  return (
    <Card className="bg-white hover:shadow-lg">
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>
          Select video duration and enter a Reddit post URL or paste the content directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Video Duration</label>
          <Select value={selectedDuration} onValueChange={onDurationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds (≈75 words)</SelectItem>
              <SelectItem value="60">60 seconds (≈150 words)</SelectItem>
              <SelectItem value="90">90 seconds (≈225 words)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select the duration first to ensure the content is properly sized
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Reddit post URL"
            value={redditUrl}
            onChange={(e) => onUrlChange(e.target.value)}
          />
          <Button
            onClick={onFetch}
            disabled={isGenerating || !selectedDuration}
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