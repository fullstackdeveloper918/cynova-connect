import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useVideoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState("");

  const generateVideo = async ({
    prompt,
    voice,
    duration,
  }: {
    prompt: string;
    voice: string;
    duration: number;
  }) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-video-content", {
        body: { prompt, voice, duration }
      });

      if (error) throw error;

      if (data?.script) {
        setScript(data.script);
        toast({
          title: "Success",
          description: "Video script generated successfully",
        });
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast({
        title: "Error",
        description: "Failed to generate video script",
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