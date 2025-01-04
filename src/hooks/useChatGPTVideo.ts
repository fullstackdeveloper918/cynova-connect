import { useVideoState } from "./chatgpt/useVideoState";
import { useVideoAuth } from "./chatgpt/useVideoAuth";
import { useVideoGeneration } from "./chatgpt/useVideoGeneration";
import { useVideoPreview } from "./chatgpt/useVideoPreview";
import { useVideoExport } from "./chatgpt/useVideoExport";

export const useChatGPTVideo = () => {
  const state = useVideoState();
  const { checkUser } = useVideoAuth();
  const { generateContent } = useVideoGeneration();
  const { handlePreview } = useVideoPreview();
  const { handleExport } = useVideoExport();

  const handleGenerateContent = async () => {
    const session = await checkUser();
    if (!session) return;

    await generateContent({
      prompt: state.prompt,
      setScript: state.setScript,
      setIsGenerating: state.setIsGenerating,
      setProgress: state.setProgress,
    });
  };

  const handlePreviewVideo = async () => {
    const session = await checkUser();
    if (!session) return;

    await handlePreview({
      script: state.script,
      selectedVoice: state.selectedVoice,
      selectedDuration: state.selectedDuration,
      setPreviewUrl: state.setPreviewUrl,
      setIsPreviewLoading: state.setIsPreviewLoading,
    });
  };

  const handleExportVideo = async () => {
    await handleExport({
      script: state.script,
      previewUrl: state.previewUrl,
    });
  };

  return {
    ...state,
    generateContent: handleGenerateContent,
    handlePreview: handlePreviewVideo,
    handleExport: handleExportVideo,
  };
};