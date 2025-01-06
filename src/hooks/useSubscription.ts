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
      console.log("Fetching subscription for user:", user?.id);
      
      if (!user?.id) {
        console.log("No user ID available");
        return null;
      }

      // First, try to get the active subscription
      const { data: activeSubscription, error: activeError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (activeError) {
        console.error("Error fetching active subscription:", activeError);
        throw activeError;
      }

      console.log("Active subscription data:", activeSubscription);

      if (activeSubscription) {
        return activeSubscription as Subscription;
      }

      // If no active subscription, check for any subscription
      const { data: anySubscription, error: anyError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (anyError) {
        console.error("Error fetching any subscription:", anyError);
        throw anyError;
      }

      console.log("Any subscription found:", anySubscription);

      if (anySubscription) {
        return anySubscription as Subscription;
      }

      // If no subscription found at all, return free tier
      console.log("No subscription found, returning free tier");
      return {
        id: "free-tier",
        user_id: user.id,
        plan_name: "Free",
        status: "active" as const,
        current_period_start: new Date().toISOString(),
        current_period_end: null,
        stripe_subscription_id: null,
        stripe_customer_id: null,
        plan_limits: {
          features: ["chatgpt_video", "fake_text"],
          max_duration_minutes: 10,
          max_videos_per_month: 20,
          max_exports_per_month: 10,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Subscription;
    },
    enabled: !!user?.id,
  });
};