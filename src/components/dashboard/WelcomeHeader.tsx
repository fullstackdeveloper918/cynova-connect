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

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-primary">
          Welcome back, {isLoadingUser ? 'Loading...' : userName}! 👋
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
        {userEmail === 'inke2@hotmail.com' && (
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
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
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