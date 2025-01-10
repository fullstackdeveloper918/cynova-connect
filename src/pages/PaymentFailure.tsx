import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/plans");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  useEffect(() => {
    if (!searchParams.get("session_id")) {
      navigate("/plans");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Failed</h1>
        <p className="text-muted-foreground">
          We were unable to process your payment. Please try again.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You will be redirected to the plans page in {countdown} seconds...
          </p>
          <Button 
            onClick={() => navigate("/plans")} 
            className="w-full"
          >
            Return to Plans
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;