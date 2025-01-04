import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface PreviewUrls {
  videoUrl: string;
  audioUrl: string;
}

export const useChatGPTVideo = () => {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<PreviewUrls | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("Sarah");
  const [selectedDuration, setSelectedDuration] = useState("48");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this feature.",
        variant: "destructive",
      });
      navigate("/login");
    }
    return session;
  };

  const generateContent = async () => {
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
      const session = await checkUser();
      if (!session) return;

      console.log("Calling generate-video-content function with prompt:", prompt);
      const { data, error } = await supabase.functions.invoke("generate-video-content", {
        body: { prompt, style: "engaging and professional" }
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

  const handlePreview = async () => {
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
      const session = await checkUser();
      if (!session) return;

      console.log("Calling generate-video-preview with:", { script, voice: selectedVoice, duration: selectedDuration });
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
      setPreviewUrl(data.previewUrl);
      
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

  const handleExport = async () => {
    if (!script || !previewUrl) {
      toast({
        title: "Cannot export yet",
        description: "Please generate a script and preview the video first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const session = await checkUser();
      if (!session) return;

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
        console.error("Error creating project:", projectError);
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

  return {
    prompt,
    setPrompt,
    script,
    setScript,
    isGenerating,
    isPreviewLoading,
    previewUrl,
    selectedVoice,
    setSelectedVoice,
    selectedDuration,
    setSelectedDuration,
    progress,
    generateContent,
    handlePreview,
    handleExport
  };
};