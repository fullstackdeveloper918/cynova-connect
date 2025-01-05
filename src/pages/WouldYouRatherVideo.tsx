import { SidebarProvider } from "@/components/ui/sidebar";
import { WouldYouRatherEditor } from "@/components/would-you-rather/WouldYouRatherEditor";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const WouldYouRatherVideo = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarNavigation />
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create Would You Rather Video</h1>
            <WouldYouRatherEditor />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WouldYouRatherVideo;