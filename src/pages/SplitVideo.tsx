import { VideoSplitter } from "@/components/split/VideoSplitter";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const SplitVideo = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="hidden md:block">
          <SidebarHeader className="p-6">
            <img
              src="/logo.svg"
              alt="Cynova Logo"
              className="w-48 h-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1">
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Split Videos</h1>
                <p className="text-muted-foreground">
                  Upload a video and split it into multiple segments
                </p>
              </div>
              <VideoSplitter />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SplitVideo;