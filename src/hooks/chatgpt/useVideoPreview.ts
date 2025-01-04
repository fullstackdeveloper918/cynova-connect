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
      console.log("Calling generate-video-preview with script and voice settings");
      const { data, error } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script,
          voice: selectedVoice,
          duration: selectedDuration
        }
      });

      if (error) {
        console.error("Error from generate-video-preview:", error);
        throw error;
      }

      console.log("Preview generation response:", data);
      
      // Use the first frame as preview and include audio URL
      if (data.previewUrl?.videoUrl && data.previewUrl?.audioUrl) {
        setPreviewUrl(data.previewUrl);
        
        toast({
          title: "Preview generated",
          description: "Your video preview is ready to watch.",
        });
      } else {
        throw new Error("Preview generation failed");
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