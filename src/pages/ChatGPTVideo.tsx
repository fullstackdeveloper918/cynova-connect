import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { VideoForm } from "@/components/chatgpt/VideoForm";
import { PreviewSection } from "@/components/chatgpt/PreviewSection";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const ChatGPTVideo = () => {
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Sarah");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

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

      const { data, error } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script,
          voice: selectedVoice
        }
      });

      if (error) throw error;

      setPreviewUrl(data.previewUrl);
      toast({
        title: "Preview generated",
        description: "Your video preview is ready to watch.",
      });
    } catch (error) {
      console.error("Preview generation error:", error);
      toast({
        title: "Preview generation failed",
        description: "There was an error generating your video preview.",
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

      const { error } = await supabase.functions.invoke("export-video", {
        body: { 
          script,
          voice: selectedVoice,
          previewUrl
        }
      });

      if (error) throw error;

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="hidden md:block">
          <SidebarHeader className="p-6">
            <img
              src="/logo.svg"
              alt="Cynova Logo"
              className="w-48 h-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1">
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold">ChatGPT Video Creator</h1>
                  <p className="text-muted-foreground">
                    Create engaging videos with AI-generated scripts and narration.
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <VideoForm
                    onScriptGenerated={setScript}
                    script={script}
                    onScriptChange={setScript}
                    selectedVoice={selectedVoice}
                    onVoiceSelect={setSelectedVoice}
                    isGenerating={isGenerating}
                    progress={progress}
                  />

                  <PreviewSection
                    script={script}
                    previewUrl={previewUrl}
                    selectedVoice={selectedVoice}
                    onPreview={handlePreview}
                    onExport={handleExport}
                    isPreviewLoading={isPreviewLoading}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatGPTVideo;