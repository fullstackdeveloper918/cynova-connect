import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export const SubscriptionCard = () => {
  const { data: subscription } = useSubscription();
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Subscription</h2>
          <p className="text-muted-foreground">
            Current plan: {subscription?.plan_name || "Free"}
          </p>
        </div>
      </div>
      <Button variant="outline" onClick={() => window.location.href = '/plans'}>
        Upgrade Plan
      </Button>
    </Card>
  );
};