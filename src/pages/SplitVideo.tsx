import { VideoSplitter } from "@/components/split/VideoSplitter";
import { MobileSidebar } from "@/components/MobileSidebar";

const SplitVideo = () => {
  return (
    <MobileSidebar>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Split Videos</h1>
        <p className="text-muted-foreground">
          Upload a video and split it into multiple segments
        </p>
        <VideoSplitter />
      </div>
    </MobileSidebar>
  );
};

export default SplitVideo;