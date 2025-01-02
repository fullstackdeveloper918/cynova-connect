import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const TikTokDownloader = () => {
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
            <h1 className="text-3xl font-bold mb-4">TikTok Downloader</h1>
            <p className="text-muted-foreground mb-8">
              Download TikTok videos easily with our downloader.
            </p>
            {/* TikTok downloader implementation */}
            <form>
              <input
                type="text"
                placeholder="Enter TikTok video URL"
                className="border p-2 rounded w-full"
              />
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white p-2 rounded"
              >
                Download
              </button>
            </form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TikTokDownloader;
