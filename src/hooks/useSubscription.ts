import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "./useUser";
import { addMonths } from "date-fns";

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
      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error("Error fetching subscriptions:", subscriptionError);
        throw subscriptionError;
      }

      // Special case for test user
      if (user.email === 'inke2@hotmail.com') {
        const now = new Date();
        return {
          id: "premium-test",
          user_id: user.id,
          plan_name: "Premium",
          status: "active" as const,
          current_period_start: now.toISOString(),
          current_period_end: addMonths(now, 1).toISOString(),
          stripe_subscription_id: null,
          stripe_customer_id: null,
          plan_limits: {
            features: ["chatgpt_video", "fake_text", "reddit_video", "split_video"],
            max_duration_minutes: 60,
            max_videos_per_month: 100,
            max_exports_per_month: 80,
          },
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        } as Subscription;
      }

      if (!subscription) {
        console.log("No active subscription found, returning free tier");
        const now = new Date();
        return {
          id: "free-tier",
          user_id: user.id,
          plan_name: "Free",
          status: "active" as const,
          current_period_start: now.toISOString(),
          current_period_end: addMonths(now, 1).toISOString(),
          stripe_subscription_id: null,
          stripe_customer_id: null,
          plan_limits: {
            features: ["chatgpt_video", "fake_text"],
            max_duration_minutes: 10,
            max_videos_per_month: 20,
            max_exports_per_month: 10,
          },
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        } as Subscription;
      }

      console.log("Active subscription found:", subscription);
      return subscription as Subscription;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour instead of 5 minutes
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 3,
  });
};