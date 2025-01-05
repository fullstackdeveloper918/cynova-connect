import { useVideoState } from "./chatgpt/useVideoState";
import { useVideoAuth } from "./chatgpt/useVideoAuth";
import { useVideoGeneration } from "./chatgpt/useVideoGeneration";
import { useVideoPreview } from "./chatgpt/useVideoPreview";
import { useVideoExport } from "./chatgpt/useVideoExport";

export const useChatGPTVideo = () => {
  const state = useVideoState();
  const { checkUser } = useVideoAuth();
  const { generateVideo } = useVideoGeneration();
  const { previewFrames, currentFrame, setCurrentFrame, isPlaying, togglePlayback, resetPreview } = useVideoPreview();
  const { exportVideo } = useVideoExport();

  const handleGenerateContent = async () => {
    const session = await checkUser();
    if (!session) return;

    await generateVideo({
      prompt: state.prompt,
      voice: state.selectedVoice,
      duration: parseInt(state.selectedDuration)
    });
  };

  const handlePreviewVideo = async () => {
    const session = await checkUser();
    if (!session) return;

    // Preview video logic using state.script and state.selectedVoice
    console.log("Preview video with:", { script: state.script, voice: state.selectedVoice });
  };

  const handleExportVideo = async () => {
    if (!previewFrames.length) return;
    
    await exportVideo({
      script: state.script,
      frames: previewFrames
    });
  };

  return {
    ...state,
    generateContent: handleGenerateContent,
    handlePreview: handlePreviewVideo,
    handleExport: handleExportVideo,
    previewFrames,
    currentFrame,
    setCurrentFrame,
    isPlaying,
    togglePlayback,
    resetPreview
  };
};