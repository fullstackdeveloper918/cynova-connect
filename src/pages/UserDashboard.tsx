import { DashboardContent } from "@/components/DashboardContent";
import { MobileSidebar } from "@/components/MobileSidebar";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { data: subscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  const isSubscribed = subscription?.plan_name !== "Free";

  return (
    <MobileSidebar>
      {!isLoading && !isSubscribed && (
        <Alert className="mb-6">
          <Crown className="h-4 w-4" />
          <AlertDescription>
            Welcome to Cynova! To access all features, please upgrade to a premium plan.
            <Button 
              variant="link" 
              className="ml-2 text-primary"
              onClick={() => navigate("/plans")}
            >
              View Plans
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <DashboardContent />
    </MobileSidebar>
  );
};

export default UserDashboard;