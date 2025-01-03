import { DashboardContent } from "@/components/DashboardContent";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const UserDashboard = () => {
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
            <div className="max-w-7xl mx-auto">
              <DashboardContent />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;