import { MobileSidebar } from "@/components/MobileSidebar";
import { VoiceoverVideoEditor } from "@/components/voiceover/VoiceoverVideoEditor";

const VoiceoverVideo = () => {
  return (
    <MobileSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Voiceover Videos</h1>
          <p className="text-muted-foreground">
            Create professional videos with AI-powered voiceovers.
          </p>
        </div>
        <VoiceoverVideoEditor />
      </div>
    </MobileSidebar>
  );
};

export default VoiceoverVideo;