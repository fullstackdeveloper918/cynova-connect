import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { YouTubeDownloader as YouTubeDownloaderComponent } from "@/components/YouTubeDownloader";

const YouTubeDownloader = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="lg:block">
          <SidebarHeader className="p-4">
            <img
              src="/logo.png"
              alt="Cynova Logo"
              className="h-8 w-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">YouTube Downloader</h1>
            <p className="text-muted-foreground mb-8">
              Download YouTube videos in your preferred quality.
            </p>
            <YouTubeDownloaderComponent />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default YouTubeDownloader;