import { Card } from "@/components/ui/card";
import { CreditCard, Calendar } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";

export const BillingCard = () => {
  const { data: subscription } = useSubscription();

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMMM d, yyyy");
  };

  const nextBillingDate = subscription?.current_period_end 
    ? formatDate(subscription.current_period_end)
    : "N/A";

  const lastBillingDate = subscription?.current_period_start 
    ? formatDate(subscription.current_period_start)
    : "N/A";

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Billing Information</h2>
          <p className="text-muted-foreground">View your billing details and history</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Next Payment</p>
            <p className="text-sm text-muted-foreground">{nextBillingDate}</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <CreditCard className="w-5 h-5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Last Payment</p>
            <p className="text-sm text-muted-foreground">{lastBillingDate}</p>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Your {subscription?.plan_name || "Free"} plan will automatically renew on {nextBillingDate}.
          </p>
        </div>
      </div>
    </Card>
  );
};