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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { 
    data: subscription, 
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription
  } = useSubscription();
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  // Enhanced session verification
  useEffect(() => {
    const checkAndSetSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        if (currentSession && currentSession !== session.user.id) {
          console.log("Session mismatch detected, clearing session");
          await supabase.auth.signOut();
          localStorage.clear();
          navigate("/login");
          return;
        }

        setCurrentSession(session.user.id);
      } catch (error) {
        console.error("Session check error:", error);
        navigate("/login");
      }
    };

    checkAndSetSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user.id);
        
        if (event === 'SIGNED_OUT' || !session) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        if (currentSession && currentSession !== session.user.id) {
          console.log("Session mismatch on auth change");
          await supabase.auth.signOut();
          localStorage.clear();
          navigate("/login");
          return;
        }

        setCurrentSession(session.user.id);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, currentSession]);

  // Enhanced subscription check and refresh logic
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsCheckingSubscription(true);
        const fromPayment = sessionStorage.getItem('from_payment');
        
        if (fromPayment) {
          console.log('Detected return from payment, checking subscription status');
          sessionStorage.removeItem('from_payment');
          let attempts = 0;
          const maxAttempts = 10; // Increased attempts
          const delayMs = 2000; // 2 seconds between attempts
          
          while (attempts < maxAttempts) {
            console.log(`Attempt ${attempts + 1} to fetch subscription`);
            const result = await refetchSubscription();
            
            if (result.data?.plan_name && result.data.plan_name !== 'Free') {
              console.log('Subscription updated successfully:', result.data);
              toast.success(`Successfully upgraded to ${result.data.plan_name} plan!`);
              break;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
          }
          
          if (attempts === maxAttempts) {
            console.error('Max attempts reached without subscription update');
            toast.error("Your subscription status is taking longer than expected to update. Please refresh the page in a few moments.");
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast.error("There was an error checking your subscription status.");
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [refetchSubscription]);

  const userName = user?.name || 'User';
  const userEmail = user?.email;
  const isFreePlan = !isLoadingSubscription && subscription?.plan_name === "Free";

  console.log("Dashboard subscription state:", { 
    subscription, 
    isFreePlan, 
    isCheckingSubscription,
    isLoadingSubscription 
  });

  if (isLoadingSubscription || isCheckingSubscription) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="w-full maintopbar">
        <WelcomeHeader
          userName={userName}
          userEmail={userEmail}
          subscription={subscription}
          isLoadingUser={isLoadingUser}
          isLoadingSubscription={isLoadingSubscription}
          subscriptionError={subscriptionError}
        />
      </div>

      {isFreePlan && (
        <div className="w-full">
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
        </div>
      )}

      <p className="text-muted-foreground textContent">
        Create and manage your video content with ease.
      </p>

      <div className="w-full cynovatab">
        <UpdatesSection />
      </div>

      <div className="w-full">
        {!isFreePlan ? (
          <FeatureGrid isFreePlan={isFreePlan} />
        ) : (
          <RequireSubscription>
            <FeatureGrid isFreePlan={isFreePlan} />
          </RequireSubscription>
        )}
      </div>
    </div>
  );
};