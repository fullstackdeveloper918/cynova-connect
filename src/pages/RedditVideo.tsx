import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { RedditVideoEditor } from "@/components/reddit/RedditVideoEditor";

const RedditVideo = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-4">Reddit Videos</h1>
        <p className="text-muted-foreground mb-8">
          Transform Reddit content into engaging video stories.
        </p>
        <RedditVideoEditor />
      </div>
    </DashboardLayout>
  );
};

export default RedditVideo;