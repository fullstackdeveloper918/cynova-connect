import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useVideoGeneration = () => {
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideo = async ({
    prompt,
    voice,
    duration,
  }: {
    prompt: string;
    voice: string;
    duration: number;
  }) => {
    if (!prompt) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what kind of video you want to create.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video-content", {
        body: { 
          prompt,
          style: "engaging and professional",
          minWords: 100,
          targetDuration: duration
        }
      });

      if (error) throw error;

      setScript(data.script);
      
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

  return {
    generateVideo,
    isGenerating,
    script,
    setScript,
  };
};