import { useState } from "react";
import { PromptInput } from "./PromptInput";
import { VoiceSelector } from "./VoiceSelector";
import { DurationSelector } from "./DurationSelector";
import { VideoPreview } from "./VideoPreview";
import { PreviewControls } from "./PreviewControls";
import { ScriptEditor } from "./ScriptEditor";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useVideoGeneration } from "@/hooks/chatgpt/useVideoGeneration";
import { useVideoPreview } from "@/hooks/chatgpt/useVideoPreview";
import { useVideoExport } from "@/hooks/chatgpt/useVideoExport";

export const ChatGPTVideoEditor = () => {
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [duration, setDuration] = useState(30);
  const { toast } = useToast();

  const {
    generateVideo,
    isGenerating,
    script,
    setScript,
  } = useVideoGeneration();

  const {
    previewFrames,
    currentFrame,
    setCurrentFrame,
    isPlaying,
    togglePlayback,
    resetPreview,
  } = useVideoPreview();

  const { exportVideo, isExporting } = useVideoExport();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    await generateVideo({
      prompt,
      voice,
      duration,
    });
  };

  const handleExport = async () => {
    if (!script || !previewFrames.length) {
      toast({
        title: "Error",
        description: "Please generate a video first",
        variant: "destructive",
      });
      return;
    }

    await exportVideo({
      script,
      voice,
      frames: previewFrames,
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <PromptInput value={prompt} onChange={setPrompt} />
          <VoiceSelector value={voice} onChange={setVoice} />
          <DurationSelector value={duration} onChange={setDuration} />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Video"}
          </Button>
        </div>

        <div className="space-y-6">
          <ScriptEditor value={script} onChange={setScript} />
          <Button
            onClick={handleExport}
            disabled={isExporting || !script || !previewFrames.length}
            className="w-full"
          >
            {isExporting ? "Exporting..." : "Export Video"}
          </Button>
        </div>
      </div>

      {previewFrames.length > 0 && (
        <div className="space-y-4">
          <VideoPreview
            frames={previewFrames}
            currentFrame={currentFrame}
            isPlaying={isPlaying}
          />
          <PreviewControls
            currentFrame={currentFrame}
            totalFrames={previewFrames.length}
            isPlaying={isPlaying}
            onFrameChange={setCurrentFrame}
            onPlayPause={togglePlayback}
            onReset={resetPreview}
          />
        </div>
      )}
    </div>
  );
};