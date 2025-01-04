import { motion } from "framer-motion";
import { SidebarProvider, Sidebar, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { VideoPreview } from "@/components/chatgpt/VideoPreview";
import { ScriptEditor } from "@/components/chatgpt/ScriptEditor";
import { VoiceSelector } from "@/components/chatgpt/VoiceSelector";
import { DurationSelector } from "@/components/chatgpt/DurationSelector";
import { PromptInput } from "@/components/chatgpt/PromptInput";
import { PreviewControls } from "@/components/chatgpt/PreviewControls";
import { useChatGPTVideo } from "@/hooks/useChatGPTVideo";

const ChatGPTVideo = () => {
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
    handleExport
  } = useChatGPTVideo();

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
                Create engaging videos with AI-generated scripts and narration.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">1. Set Video Parameters</h2>
                  <div className="space-y-4">
                    <DurationSelector
                      selectedDuration={selectedDuration}
                      onDurationSelect={setSelectedDuration}
                    />
                    <PromptInput
                      prompt={prompt}
                      onPromptChange={setPrompt}
                      onGenerate={generateContent}
                      isGenerating={isGenerating}
                      progress={progress}
                    />
                  </div>
                </div>

                {script && (
                  <>
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold">2. Edit Script</h2>
                      <ScriptEditor script={script} onScriptChange={setScript} />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold">3. Choose Voice</h2>
                      <VoiceSelector
                        selectedVoice={selectedVoice}
                        onVoiceSelect={setSelectedVoice}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Preview</h2>
                <VideoPreview
                  script={script}
                  previewUrl={previewUrl}
                  selectedVoice={selectedVoice}
                />
                <PreviewControls
                  script={script}
                  previewUrl={previewUrl}
                  onPreview={handlePreview}
                  onExport={handleExport}
                  isPreviewLoading={isPreviewLoading}
                />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatGPTVideo;