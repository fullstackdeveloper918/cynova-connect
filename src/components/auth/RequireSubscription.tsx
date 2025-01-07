import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RequireSubscriptionProps {
  children: React.ReactNode;
}

export const RequireSubscription = ({ children }: RequireSubscriptionProps) => {
  const navigate = useNavigate();
  const { data: subscription, isLoading, error } = useSubscription();

  // Check if user has an active paid subscription
  const isSubscribed = subscription?.plan_name && subscription.plan_name !== "Free";

  useEffect(() => {
    // Only redirect if we have subscription data and user is not subscribed
    if (!isLoading && !error && subscription && !isSubscribed) {
      console.log("User not subscribed, redirecting to plans", { subscription });
      toast({
        title: "Premium Feature",
        description: "This feature requires a paid subscription. Please upgrade your plan to continue.",
        variant: "destructive",
      });
      navigate("/plans");
    }
  }, [isLoading, error, isSubscribed, subscription, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    console.error("Subscription check error:", error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Unable to verify subscription status. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // If not subscribed, show upgrade message
  if (!isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Alert variant="destructive" className="max-w-md">
          <Crown className="h-4 w-4" />
          <AlertDescription>
            This feature is only available for premium users. Please upgrade your plan to access this feature.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate("/plans")} 
          className="mt-4"
        >
          Upgrade Now
        </Button>
      </div>
    );
  }

  // If subscribed, render children
  return <>{children}</>;
};