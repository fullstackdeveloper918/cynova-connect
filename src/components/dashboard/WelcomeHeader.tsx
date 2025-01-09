import { Crown, Shield, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

interface WelcomeHeaderProps {
  userName: string;
  userEmail: string | undefined;
  subscription: any;
  isLoadingUser: boolean;
  isLoadingSubscription: boolean;
  subscriptionError: any;
}

export const WelcomeHeader = ({
  userName,
  userEmail,
  subscription,
  isLoadingUser,
  isLoadingSubscription,
  subscriptionError,
}: WelcomeHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (!session?.user?.id) {
          console.log("No active session found");
          return;
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error checking admin role:", roleError);
          return;
        }

        setIsAdmin(roleData?.role === 'admin');
      } catch (error) {
        console.error("Error in checkAdminRole:", error);
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (userEmail) {
      checkAdminRole();
    }
  }, [userEmail]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      // Clear auth data first
      localStorage.removeItem('sb-fkrvvlfhdjxqadmupldb-auth-token');
      document.cookie = 'sb-access-token=; Max-Age=0; path=/;';
      document.cookie = 'sb-refresh-token=; Max-Age=0; path=/;';
      
      // Then attempt to sign out
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        // If session not found, just proceed with navigation
        if (signOutError.status === 403) {
          navigate('/login');
          return;
        }
        
        console.error("Logout error:", signOutError);
        toast({
          title: "Error logging out",
          description: "There was a problem logging out. Please try again.",
          variant: "destructive",
        });
        return;
      }

      navigate('/login');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoadingUser || isCheckingRole) {
    return (
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-primary">
          Welcome back, {userName}! 👋
        </h1>
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            {isLoadingSubscription ? (
              "Loading plan..."
            ) : subscriptionError ? (
              "Error loading plan"
            ) : (
              `Current Plan: ${subscription?.plan_name || "Free"}`
            )}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button
            onClick={() => navigate("/admin")}
            variant="destructive"
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Button>
        )}
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <Button
              variant="outline"
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-48 p-2">
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </HoverCardContent>
        </HoverCard>
        <Button
          onClick={() => navigate("/plans")}
          variant="default"
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
        >
          Plans
        </Button>
      </div>
    </div>
  );
};
