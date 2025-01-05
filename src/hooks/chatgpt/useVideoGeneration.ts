import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface GenerationState {
  prompt: string;
  setScript: (script: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
}

export const useVideoGeneration = () => {
  const generateContent = async ({
    prompt,
    setScript,
    setIsGenerating,
    setProgress,
  }: GenerationState) => {
    if (!prompt) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what kind of video you want to create.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(25);

    try {
      console.log("Calling generate-video-content function with prompt:", prompt);
      const { data, error } = await supabase.functions.invoke("generate-video-content", {
        body: { 
          prompt,
          style: "engaging and professional",
          minWords: 100, // Ensure script is long enough for 30 seconds
          targetDuration: 30 // Target duration in seconds
        }
      });

      if (error) {
        console.error("Error from generate-video-content:", error);
        throw error;
      }

      console.log("Generated content response:", data);
      setScript(data.script);
      setProgress(100);
      toast({
        title: "Script generated successfully",
        description: "You can now edit the script and preview the video.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your video content.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateContent };
};