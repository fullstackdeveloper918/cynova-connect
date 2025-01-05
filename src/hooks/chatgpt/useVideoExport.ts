import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/hooks/useUser";

interface ExportState {
  script: string;
  previewUrl: {
    videoUrl: string;
    audioUrl: string;
  } | null;
}

export const useVideoExport = () => {
  const { user: session } = useUser();

  const handleExport = async ({ script, previewUrl }: ExportState) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to export videos.",
        variant: "destructive",
      });
      return;
    }

    if (!previewUrl?.videoUrl) {
      toast({
        title: "No preview available",
        description: "Please generate a preview before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a project first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          title: "ChatGPT Generated Video",
          description: script.substring(0, 100) + "...",
          type: "chatgpt_video",
          thumbnail_url: previewUrl.videoUrl
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
          user_id: session.user.id,
          project_id: projectData.id,
          title: "ChatGPT Generated Video",
          description: script.substring(0, 100) + "...",
          file_url: previewUrl.videoUrl,
          thumbnail_url: previewUrl.videoUrl,
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
    }
  };

  return { handleExport };
};