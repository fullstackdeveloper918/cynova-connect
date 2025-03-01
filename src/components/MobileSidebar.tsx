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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface MobileSidebarProps {
  children: React.ReactNode;
}

export const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      localStorage.removeItem('sb-fkrvvlfhdjxqadmupldb-auth-token');
      document.cookie = 'sb-access-token=; Max-Age=0; path=/;';
      document.cookie = 'sb-refresh-token=; Max-Age=0; path=/;';
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        if (signOutError.status === 403) {
          setIsOpen(false);
          navigate('/login');
          return;
        }
        
        console.error("Logout error:", signOutError);
        toast.error("There was a problem logging out. Please try again.");
        return;
      }

      setIsOpen(false);
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(false);
    setTimeout(() => {
      navigate("/dashboard/profile");
    }, 100);
  };

  return (
    <SidebarProvider className="mainContainer">
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="hidden md:block">
          <SidebarHeader className="p-6 bg-white border-b border-gray-200">
            <img
              src="/lovable-uploads/ef5e3724-9332-4994-ad12-3edcdb1c5cb7.png"
              alt="Cynova Logo"
              className="w-28 h-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1">
          {isMobile && (
            <div className="p-4 sticky top-0 z-50 bg-background border-b flex items-center justify-between">
              <SidebarTrigger />
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2 h-12 w-12 touch-manipulation active:scale-95 transition-transform"
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      cursor: 'pointer',
                      touchAction: 'manipulation'
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setIsOpen(true);
                    }}
                    onClick={() => setIsOpen(true)}
                    role="button"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                  >
                    <User className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="w-[90vw] max-w-[300px] p-0 bg-white"
                  style={{ zIndex: 100 }}
                >
                  <DialogTitle className="sr-only">User Menu</DialogTitle>
                  <DialogDescription className="sr-only">
                    Access your profile settings and logout options
                  </DialogDescription>
                  <div className="flex flex-col w-full">
                    <button
                      onClick={handleProfileClick}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleProfileClick(e);
                      }}
                      className="w-full flex items-center gap-3 px-6 py-5 text-base hover:bg-accent border-b"
                      style={{ 
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        touchAction: 'manipulation',
                        cursor: 'pointer',
                        zIndex: 101
                      }}
                      role="menuitem"
                    >
                      <User className="h-5 w-5" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        if (!isLoggingOut) handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-6 py-5 text-base text-red-600 hover:bg-red-50 disabled:opacity-50"
                      style={{ 
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        touchAction: 'manipulation',
                        cursor: 'pointer',
                        zIndex: 101
                      }}
                      role="menuitem"
                    >
                      <LogOut className="h-5 w-5" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="p-6 ">
            <div className="conatinerBox mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};