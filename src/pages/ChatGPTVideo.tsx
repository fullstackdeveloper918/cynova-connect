import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wand2, Play, Save, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoPreview } from "@/components/chatgpt/VideoPreview";
import { ScriptEditor } from "@/components/chatgpt/ScriptEditor";
import { VoiceSelector } from "@/components/chatgpt/VoiceSelector";

const ChatGPTVideo = () => {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Sarah");
  const [progress, setProgress] = useState(0);

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
      const { data, error } = await supabase.functions.invoke("generate-video-content", {
        body: { prompt, style: "engaging and professional" },
      });

      if (error) throw error;

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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Describe Your Video</h2>
              <Textarea
                placeholder="Describe the video you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-32"
              />
              <Button
                onClick={generateContent}
                disabled={isGenerating || !prompt}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Script
                  </>
                )}
              </Button>
              {isGenerating && <Progress value={progress} />}
            </div>

            {script && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">2. Edit Script</h2>
                <ScriptEditor script={script} onScriptChange={setScript} />
              </div>
            )}

            {script && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">3. Choose Voice</h2>
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onVoiceSelect={setSelectedVoice}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Preview</h2>
            <VideoPreview
              script={script}
              previewUrl={previewUrl}
              selectedVoice={selectedVoice}
            />
            {script && (
              <div className="flex gap-4">
                <Button className="flex-1" onClick={() => {}}>
                  <Play className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => {}}>
                  <Save className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatGPTVideo;