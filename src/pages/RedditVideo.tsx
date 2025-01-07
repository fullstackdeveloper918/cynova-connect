import { RedditVideoEditor } from "@/components/reddit/RedditVideoEditor";
import { MobileSidebar } from "@/components/MobileSidebar";

const RedditVideo = () => {
  return (
    <MobileSidebar>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Reddit Videos</h1>
        <p className="text-muted-foreground mb-8">
          Transform Reddit content into engaging video stories.
        </p>
        <RedditVideoEditor />
      </div>
    </MobileSidebar>
  );
};

export default RedditVideo;