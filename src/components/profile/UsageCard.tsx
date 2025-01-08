import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UsageData {
  videos_created: number;
  export_minutes_used: number;
  storage_used: number;
}

export const UsageCard = () => {
  const { data: subscription } = useSubscription();
  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('month_start', new Date().toISOString().slice(0, 7) + '-01')
        .maybeSingle();

      if (error) throw error;
      return data as UsageData | null;
    },
  });

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Usage Allowance</h2>
          <p className="text-muted-foreground mb-4">
            No usage allowance available. Upgrade to access features.
          </p>
        </div>
      </Card>
    );
  }

  const limits = subscription.plan_limits || {
    max_videos_per_month: 0,
    max_duration_minutes: 0,
  };

  const videosPercentage = usage 
    ? (usage.videos_created / limits.max_videos_per_month) * 100 
    : 0;
  
  const minutesPercentage = usage 
    ? (usage.export_minutes_used / limits.max_duration_minutes) * 100 
    : 0;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Resource Usage</h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">AI Videos</span>
            <span className="text-sm text-muted-foreground">
              {usage?.videos_created || 0} / {limits.max_videos_per_month} videos/month
            </span>
          </div>
          <Progress value={videosPercentage} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Export Minutes</span>
            <span className="text-sm text-muted-foreground">
              {usage?.export_minutes_used || 0} / {limits.max_duration_minutes} minutes
            </span>
          </div>
          <Progress value={minutesPercentage} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Storage Used</span>
            <span className="text-sm text-muted-foreground">
              {((usage?.storage_used || 0) / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};