import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { VideoSplitter } from "@/components/split/VideoSplitter";

const SplitVideo = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-4">Split Videos</h1>
        <p className="text-muted-foreground mb-8">
          Easily split and trim your videos with precision.
        </p>
        <VideoSplitter />
      </div>
    </DashboardLayout>
  );
};

export default SplitVideo;