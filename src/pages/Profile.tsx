import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { ProfileContent } from "@/components/ProfileContent";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="hidden md:block">
          <SidebarHeader className="p-4">
            <img
              src="/logo.png"
              alt="Cynova Logo"
              className="h-8 w-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1">
          {isMobile && (
            <div className="p-4 sticky top-0 z-50 bg-background border-b">
              <SidebarTrigger />
            </div>
          )}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <ProfileContent />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Profile;