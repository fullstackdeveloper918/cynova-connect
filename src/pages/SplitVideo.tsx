import { VideoSplitter } from "@/components/split/VideoSplitter";

const SplitVideo = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Split Videos</h1>
        <p className="text-muted-foreground">
          Upload a video and split it into multiple segments
        </p>
      </div>
      <VideoSplitter />
    </div>
  );
};

export default SplitVideo;