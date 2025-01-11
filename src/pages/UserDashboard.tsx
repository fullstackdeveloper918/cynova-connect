import { DashboardContent } from "@/components/DashboardContent";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="hidden md:block">
          <SidebarHeader className="p-6">
            <img
              src="/lovable-uploads/ef5e3724-9332-4994-ad12-3edcdb1c5cb7.png"
              alt="Cynova Logo"
              className="w-48 h-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1">
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
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
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;