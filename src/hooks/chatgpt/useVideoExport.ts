import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ExportState {
  script: string;
  previewUrl: {
    videoUrl: string;
    audioUrl: string;
  } | null;
}

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportVideo = async ({
    script,
    previewUrl,
  }: ExportState) => {
    if (!script || !previewUrl?.videoUrl) {
      toast({
        title: "No preview available",
        description: "Please generate a preview before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Create a project first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: "ChatGPT Generated Video",
          description: script.substring(0, 100) + "...",
          type: "chatgpt_video",
          thumbnail_url: previewUrl.videoUrl,
          video_url: previewUrl.videoUrl,
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
          project_id: projectData.id,
          title: "ChatGPT Generated Video",
          description: script.substring(0, 100) + "...",
          file_url: previewUrl.videoUrl,
          thumbnail_url: previewUrl.videoUrl,
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
