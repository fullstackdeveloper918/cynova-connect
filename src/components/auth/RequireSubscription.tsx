import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface RequireSubscriptionProps {
  children: React.ReactNode;
}

export const RequireSubscription = ({ children }: RequireSubscriptionProps) => {
  const navigate = useNavigate();
  const { data: subscription, isLoading } = useSubscription();

  const isSubscribed = subscription?.plan_name !== "Free";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Alert variant="destructive" className="max-w-md">
          <Crown className="h-4 w-4" />
          <AlertDescription>
            This feature is only available for premium users. Please upgrade your plan to access this feature.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/plans")} className="mt-4">
          Upgrade Now
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};