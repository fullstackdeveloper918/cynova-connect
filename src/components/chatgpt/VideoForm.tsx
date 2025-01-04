import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ScriptEditor } from "./ScriptEditor";
import { VoiceSelector } from "./VoiceSelector";

interface VideoFormProps {
  onScriptGenerated: (script: string) => void;
  script: string;
  onScriptChange: (script: string) => void;
  selectedVoice: string;
  onVoiceSelect: (voice: string) => void;
  isGenerating: boolean;
  progress: number;
}

export const VideoForm = ({
  onScriptGenerated,
  script,
  onScriptChange,
  selectedVoice,
  onVoiceSelect,
  isGenerating,
  progress,
}: VideoFormProps) => {
  const [prompt, setPrompt] = useState("");

  const generateContent = async () => {
    if (!prompt) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what kind of video you want to create.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-video-content", {
        body: { prompt, style: "engaging and professional" }
      });

      if (error) throw error;

      onScriptGenerated(data.script);
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
    }
  };

  return (
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
          <ScriptEditor script={script} onScriptChange={onScriptChange} />
        </div>
      )}

      {script && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Choose Voice</h2>
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceSelect={onVoiceSelect}
          />
        </div>
      )}
    </div>
  );
};