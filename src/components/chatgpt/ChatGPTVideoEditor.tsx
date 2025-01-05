import { useChatGPTVideo } from "@/hooks/useChatGPTVideo";
import { PromptInput } from "./PromptInput";
import { ScriptEditor } from "./ScriptEditor";
import { VoiceSelector } from "./VoiceSelector";
import { DurationSelector } from "./DurationSelector";
import { VideoPreview } from "./VideoPreview";
import { PreviewControls } from "./PreviewControls";

export const ChatGPTVideoEditor = () => {
  const {
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
    handleExport,
  } = useChatGPTVideo();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <PromptInput
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={generateContent}
          isGenerating={isGenerating}
          progress={progress}
        />

        {script && (
          <>
            <ScriptEditor script={script} onScriptChange={setScript} />
            <div className="grid grid-cols-2 gap-4">
              <VoiceSelector
                selectedVoice={selectedVoice}
                onVoiceSelect={setSelectedVoice}
              />
              <DurationSelector
                selectedDuration={selectedDuration}
                onDurationSelect={setSelectedDuration}
              />
            </div>
            <PreviewControls
              script={script}
              previewUrl={previewUrl}
              onPreview={handlePreview}
              onExport={handleExport}
              isPreviewLoading={isPreviewLoading}
            />
          </>
        )}
      </div>

      <div>
        <VideoPreview
          script={script}
          previewUrl={previewUrl}
          selectedVoice={selectedVoice}
        />
      </div>
    </div>
  );
};