import { YouTubeDownloader } from "@/components/YouTubeDownloader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const YouTubeDownloaderPage = () => {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">YouTube Downloader</h1>
        <YouTubeDownloader />
      </main>
    </div>
  );
};

export default YouTubeDownloaderPage;