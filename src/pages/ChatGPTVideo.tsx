import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { PromptInput } from "@/components/chatgpt/PromptInput";
import { VideoPreviewGrid } from "@/components/chatgpt/VideoPreviewGrid";

interface Scene {
  description: string;
  duration: number;
  imageUrl: string;
}

const ChatGPTVideo = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scenes, setScenes] = useState<Scene[]>([]);
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

      const { data, error } = await supabase.functions.invoke("generate-video-content", {
        body: { prompt, style: "engaging and professional" }
      });

      if (error) throw error;

      setScenes(data.scenes);
      setProgress(100);
      toast({
        title: "Video content generated successfully",
        description: "Your video scenes have been generated.",
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

  const handleExport = async () => {
    if (!scenes.length) {
      toast({
        title: "Cannot export yet",
        description: "Please generate video content first.",
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

      // Save the project to the database
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            user_id: session.user.id,
            title: prompt.substring(0, 50),
            description: prompt,
            type: 'chatgpt',
            thumbnail_url: scenes[0].imageUrl,
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      toast({
        title: "Export successful",
        description: "Your video has been saved to your projects.",
      });

      navigate("/dashboard/projects");
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error saving your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="lg:block">
          <SidebarHeader className="p-4">
            <img
              src="/logo.png"
              alt="Cynova Logo"
              className="h-8 w-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">ChatGPT Video Creator</h1>
              <p className="text-muted-foreground">
                Create engaging videos with AI-generated scenes and narration.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <PromptInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  isGenerating={isGenerating}
                  progress={progress}
                  onGenerate={generateContent}
                />
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Preview</h2>
                <VideoPreviewGrid scenes={scenes} />
                {scenes.length > 0 && (
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={handleExport}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save to Projects
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatGPTVideo;