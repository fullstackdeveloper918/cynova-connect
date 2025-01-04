import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SimpleVideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const { toast } = useToast();

  const generateVideo = async () => {
    if (!prompt) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what kind of video you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("simple-video-generate", {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
        toast({
          title: "Video generated successfully",
          description: "Your video is ready to preview",
        });
      }
    } catch (error) {
      console.error("Video generation error:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 bg-card rounded-lg border">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Simple Video Generator</h2>
        <p className="text-muted-foreground">
          Enter a description of the video you want to create
        </p>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Example: A serene mountain landscape with snow-capped peaks..."
        className="h-32"
      />

      <Button 
        onClick={generateVideo}
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
            <Play className="mr-2 h-4 w-4" />
            Generate Video
          </>
        )}
      </Button>

      {videoUrl && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preview</h3>
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: "400px" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};