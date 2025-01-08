import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MobileSidebarProps {
  children: React.ReactNode;
}

export const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

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
            <div className="p-4 sticky top-0 z-50 bg-background border-b flex items-center justify-between">
              <SidebarTrigger />
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-72 p-0">
                  <div className="flex flex-col w-full">
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-accent border-b"
                    >
                      <User className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};