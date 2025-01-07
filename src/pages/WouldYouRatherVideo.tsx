import { WouldYouRatherEditor } from "@/components/would-you-rather/WouldYouRatherEditor";
import { MobileSidebar } from "@/components/MobileSidebar";

const WouldYouRatherVideo = () => {
  return (
    <MobileSidebar>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Would You Rather Videos</h1>
        <p className="text-muted-foreground mb-8">
          Create engaging would you rather videos for social media.
        </p>
        <WouldYouRatherEditor />
      </div>
    </MobileSidebar>
  );
};

export default WouldYouRatherVideo;