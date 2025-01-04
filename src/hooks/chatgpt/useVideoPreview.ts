import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface PreviewState {
  script: string;
  selectedVoice: string;
  selectedDuration: string;
  setPreviewUrl: (url: { videoUrl: string; audioUrl: string; } | null) => void;
  setIsPreviewLoading: (isLoading: boolean) => void;
}

export const useVideoPreview = () => {
  const handlePreview = async ({
    script,
    selectedVoice,
    selectedDuration,
    setPreviewUrl,
    setIsPreviewLoading,
  }: PreviewState) => {
    if (!script) {
      toast({
        title: "No script available",
        description: "Please generate or enter a script first.",
        variant: "destructive",
      });
      return;
    }

    setIsPreviewLoading(true);
    try {
      console.log("Calling generate-video-frames with script");
      const { data, error } = await supabase.functions.invoke("generate-video-frames", {
        body: { script }
      });

      if (error) {
        console.error("Error from generate-video-frames:", error);
        throw error;
      }

      console.log("Frame generation response:", data);
      
      // For now, we'll just use the first frame as a preview
      // In a full implementation, we'd stitch these frames together into a video
      setPreviewUrl({
        videoUrl: data.frameUrls[0],
        audioUrl: "" // We'll implement audio separately
      });
      
      toast({
        title: "Preview generated",
        description: "Your video preview is ready to watch.",
      });

    } catch (error) {
      console.error("Preview generation error:", error);
      toast({
        title: "Preview generation failed",
        description: "There was an error generating your video preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return { handlePreview };
};