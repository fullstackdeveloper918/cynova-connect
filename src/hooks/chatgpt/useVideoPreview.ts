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
      
      // Use the first frame as preview
      if (data.frameUrls && data.frameUrls.length > 0) {
        setPreviewUrl({
          videoUrl: data.frameUrls[0],
          audioUrl: "" // We'll implement audio separately
        });
        
        toast({
          title: "Preview generated",
          description: "Your video preview is ready to watch.",
        });
      } else {
        throw new Error("No frames were generated");
      }

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