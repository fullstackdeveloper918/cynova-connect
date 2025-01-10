import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: subscription, isLoading } = useSubscription();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  useEffect(() => {
    if (!searchParams.get("session_id")) {
      navigate("/dashboard");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for subscribing to the {subscription?.plan_name} plan.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You will be redirected to the dashboard in {countdown} seconds...
          </p>
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="w-full"
          >
            Go to Dashboard Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;