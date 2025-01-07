import { TikTokDownloader as TikTokDownloaderComponent } from "@/components/TikTokDownloader";
import { MobileSidebar } from "@/components/MobileSidebar";

const TikTokDownloader = () => {
  return (
    <MobileSidebar>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">TikTok Downloader</h1>
        <p className="text-muted-foreground mb-8">
          Download TikTok videos easily with our downloader.
        </p>
        <TikTokDownloaderComponent />
      </div>
    </MobileSidebar>
  );
};

export default TikTokDownloader;