import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface ExportState {
  script: string;
  previewUrl: { videoUrl: string; audioUrl: string; } | null;
}

export const useVideoExport = () => {
  const navigate = useNavigate();

  const handleExport = async ({ script, previewUrl }: ExportState) => {
    if (!script || !previewUrl) {
      toast({
        title: "Cannot export yet",
        description: "Please generate a script and preview the video first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this feature.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Create a project first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          title: "iMessage Conversation",
          description: script,
          type: "fake_text",
          thumbnail_url: previewUrl.videoUrl, // We'll use a frame from the video as thumbnail
          video_url: previewUrl.videoUrl
        })
        .select()
        .single();

      if (projectError) {
        console.error("Error creating project:", projectError);
        throw projectError;
      }

      console.log("Project created:", projectData);

      // Create the export record
      const { data: exportData, error: exportError } = await supabase
        .from('exports')
        .insert({
          user_id: session.user.id,
          project_id: projectData.id,
          title: "iMessage Conversation",
          description: script,
          file_url: previewUrl.videoUrl,
          thumbnail_url: previewUrl.videoUrl,
          file_type: "mp4",
          status: 'completed',
          file_size: 0 // This would need to be calculated from the actual video file
        })
        .select()
        .single();

      if (exportError) {
        console.error("Error creating export:", exportError);
        throw exportError;
      }

      console.log("Export created:", exportData);

      toast({
        title: "Export successful",
        description: "Your video has been exported and saved to your account.",
      });

      navigate("/dashboard/exports");
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