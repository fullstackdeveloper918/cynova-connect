import { RedditVideoEditor } from "@/components/reddit/RedditVideoEditor";
import { MobileSidebar } from "@/components/MobileSidebar";

const RedditVideo = () => {
  return (
    <MobileSidebar>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Reddit Videos</h1>
          <p className="text-muted-foreground">
            Transform Reddit content into engaging video stories. Follow the steps below to create your video.
          </p>
          <RedditVideoEditor />
        </div>
      </div>
    </MobileSidebar>
  );
};

export default RedditVideo;