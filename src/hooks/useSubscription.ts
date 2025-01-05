import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "./useUser";

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: "active" | "canceled" | "past_due";
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan_limits: {
    features: string[];
    max_duration_minutes: number;
    max_videos_per_month: number;
    max_exports_per_month: number;
  };
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) {
        throw error;
      }

      return data as Subscription;
    },
    enabled: !!user?.id,
  });
};