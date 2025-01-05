import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackgroundSelector } from "./BackgroundSelector";
import { VideoPreview } from "./VideoPreview";
import { ResolutionSelector, type VideoResolution } from "./ResolutionSelector";
import { SpeechToText } from "./SpeechToText";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";

export const RedditVideoEditor = () => {
  const [redditUrl, setRedditUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution>("youtube");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const { toast } = useToast();

  const handleFetch = async () => {
    if (!redditUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a Reddit post URL",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: Implement Reddit content fetching
      const mockContent = "This is a mock Reddit post content for testing purposes.";
      setContent(mockContent);
      toast({
        title: "Content Fetched",
        description: "Reddit content has been retrieved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Reddit content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!content || !selectedBackground) {
      toast({
        title: "Missing Requirements",
        description: "Please provide content and select a background video.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: Implement video generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPreviewUrl(selectedBackground);
      toast({
        title: "Video Generated",
        description: "Your video has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeechToText = (transcript: string) => {
    setContent((prevContent) => prevContent + " " + transcript);
  };

  return (
    <div className="space-y-8">
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
              onChange={(e) => setRedditUrl(e.target.value)}
            />
            <Button
              onClick={handleFetch}
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
              <SpeechToText onTranscript={handleSpeechToText} />
            </div>
            <Textarea
              placeholder="Or paste your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video Settings</CardTitle>
          <CardDescription>
            Choose your video resolution and background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Resolution</label>
            <ResolutionSelector
              selected={selectedResolution}
              onSelect={setSelectedResolution}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Background Video</label>
            <BackgroundSelector
              selected={selectedBackground}
              onSelect={setSelectedBackground}
            />
          </div>
        </CardContent>
      </Card>

      {(content || previewUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Preview your video before generating the final version
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoPreview url={previewUrl} content={content} />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Generate Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};