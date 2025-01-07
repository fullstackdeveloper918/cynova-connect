import { YouTubeDownloader as YouTubeDownloaderComponent } from "@/components/YouTubeDownloader";
import { MobileSidebar } from "@/components/MobileSidebar";

const YouTubeDownloader = () => {
  return (
    <MobileSidebar>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">YouTube Downloader</h1>
        <p className="text-muted-foreground mb-8">
          Download YouTube videos in your preferred quality.
        </p>
        <YouTubeDownloaderComponent />
      </div>
    </MobileSidebar>
  );
};

export default YouTubeDownloader;