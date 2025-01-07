import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UpdatesSection } from "./UpdatesSection";
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";
import { WelcomeHeader } from "./dashboard/WelcomeHeader";
import { FeatureGrid } from "./dashboard/FeatureGrid";
import { RequireSubscription } from "./auth/RequireSubscription";

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { 
    data: subscription, 
    isLoading: isLoadingSubscription, 
    error: subscriptionError 
  } = useSubscription();

  const userName = user?.name || 'User';
  const userEmail = user?.email;
  const isFreePlan = !isLoadingSubscription && subscription?.plan_name === "Free";

  return (
    <div className="space-y-8">
      <WelcomeHeader
        userName={userName}
        userEmail={userEmail}
        subscription={subscription}
        isLoadingUser={isLoadingUser}
        isLoadingSubscription={isLoadingSubscription}
        subscriptionError={subscriptionError}
      />

      {isFreePlan && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Free Plan Limitations</AlertTitle>
          <AlertDescription className="text-yellow-700">
            You are currently on the Free plan. To access all features, please{" "}
            <Button
              variant="link"
              className="text-yellow-800 font-semibold p-0 h-auto hover:text-yellow-900"
              onClick={() => navigate("/plans")}
            >
              upgrade to a paid plan
            </Button>
            . Unlock premium features and create unlimited videos!
          </AlertDescription>
        </Alert>
      )}

      <p className="text-muted-foreground">
        Create and manage your video content with ease.
      </p>

      <UpdatesSection />

      <RequireSubscription>
        <FeatureGrid isFreePlan={isFreePlan} />
      </RequireSubscription>
    </div>
  );
};