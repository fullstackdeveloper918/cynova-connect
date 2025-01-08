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
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { 
    data: subscription, 
    isLoading: isLoadingSubscription, 
    error: subscriptionError 
  } = useSubscription();

  // Add session verification
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast.error("Your session has expired. Please login again.");
        navigate("/login");
        return;
      }

      // Verify the session belongs to the correct user
      if (session.user.id !== user?.id) {
        console.error("Session user ID mismatch");
        await supabase.auth.signOut();
        toast.error("Invalid session detected. Please login again.");
        navigate("/login");
        return;
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/login");
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [navigate, user?.id]);

  const userName = user?.name || 'User';
  const userEmail = user?.email;
  const isFreePlan = !isLoadingSubscription && subscription?.plan_name === "Free";

  console.log("Dashboard subscription state:", { subscription, isFreePlan });

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

      {/* Only show premium features to paid users */}
      {!isFreePlan ? (
        <FeatureGrid isFreePlan={isFreePlan} />
      ) : (
        <RequireSubscription>
          <FeatureGrid isFreePlan={isFreePlan} />
        </RequireSubscription>
      )}
    </div>
  );
};