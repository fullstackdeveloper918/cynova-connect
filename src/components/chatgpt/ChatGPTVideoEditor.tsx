import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChatGPTVideo } from "@/hooks/useChatGPTVideo";
import { PromptInput } from "./PromptInput";
import { ScriptEditor } from "./ScriptEditor";
import { VoiceSelector } from "./VoiceSelector";
import { DurationSelector } from "./DurationSelector";
import { PreviewControls } from "./PreviewControls";
import { VideoPreview } from "./VideoPreview";

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
    <Card className="p-6 canyabox">
      <div className="space-y-8">
        {/* Prompt Input Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">1. Enter Your Video Idea</h2>
          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={generateContent}
            isGenerating={isGenerating}
            progress={progress}
          />
        </div>

        {/* Script Editor Section */}
        {script && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">2. Edit Your Script</h2>
            <ScriptEditor
              script={script}
              onScriptChange={(newScript) => setScript(newScript)}
            />
          </div>
        )}

        {/* Voice and Duration Settings */}
        {script && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Voice</h3>
              <VoiceSelector
                selectedVoice={selectedVoice}
                onVoiceSelect={setSelectedVoice}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Duration</h3>
              <DurationSelector
                selectedDuration={selectedDuration}
                onDurationSelect={setSelectedDuration}
              />
            </div>
          </div>
        )}

        {/* Preview Controls */}
        {script && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">3. Preview and Export</h2>
            <PreviewControls
              script={script}
              previewUrl={previewUrl}
              onPreview={handlePreview}
              onExport={handleExport}
              isPreviewLoading={isPreviewLoading}
            />
          </div>
        )}

        {/* Video Preview */}
        {script && (
          <VideoPreview
            script={script}
            previewUrl={previewUrl}
            selectedVoice={selectedVoice}
          />
        )}
      </div>
    </Card>
  );
};