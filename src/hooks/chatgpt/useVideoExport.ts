import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ExportState {
  script: string;
  frames: string[];
}

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportVideo = async ({
    script,
    frames,
  }: ExportState) => {
    if (!script || !frames.length) {
      toast({
        title: "No preview available",
        description: "Please generate a preview before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create a project first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: "ChatGPT Generated Video",
          description: script.substring(0, 100) + "...",
          type: "chatgpt_video",
          thumbnail_url: frames[0],
          video_url: frames[0],
          status: 'completed'
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      console.log("Project created:", projectData);

      const { data: exportData, error: exportError } = await supabase
        .from('exports')
        .insert({
          user_id: user.id,
          project_id: projectData.id,
          title: "ChatGPT Generated Video",
          description: script.substring(0, 100) + "...",
          file_url: frames[0],
          thumbnail_url: frames[0],
          file_type: 'video/mp4',
          status: 'completed'
        })
        .select()
        .single();

      if (exportError) {
        throw exportError;
      }

      console.log("Export created:", exportData);

      toast({
        title: "Export successful",
        description: "Your video has been exported and saved.",
      });

    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportVideo, isExporting };
};