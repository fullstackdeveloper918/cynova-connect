import { TikTokDownloader } from "@/components/TikTokDownloader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const TikTokDownloaderPage = () => {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">TikTok Downloader</h1>
        <TikTokDownloader />
      </main>
    </div>
  );
};

export default TikTokDownloaderPage;