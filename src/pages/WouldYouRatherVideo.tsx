import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { WouldYouRatherEditor } from "@/components/would-you-rather/WouldYouRatherEditor";

const WouldYouRatherVideo = () => {
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
            <h1 className="text-3xl font-bold mb-4">Would You Rather Videos</h1>
            <p className="text-muted-foreground mb-8">
              Create engaging would you rather videos for social media.
            </p>
            <WouldYouRatherEditor />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WouldYouRatherVideo;