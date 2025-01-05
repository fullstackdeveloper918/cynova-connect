import { useCredits } from "@/hooks/useCredits";
import { Card, CardContent } from "../ui/card";
import { Coins } from "lucide-react";

export const CreditsDisplay = () => {
  const { credits, isLoadingCredits } = useCredits();

  if (isLoadingCredits) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">
            {credits?.credits_balance || 0} credits remaining
          </span>
        </div>
      </CardContent>
    </Card>
  );
};