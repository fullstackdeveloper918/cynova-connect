import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlanLimits {
  max_videos_per_month: number;
  max_exports_per_month: number;
  max_duration_minutes: number;
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan_limits: PlanLimits | null;
}

export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<Subscription | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      if (!data) return null;

      // Parse the JSON plan_limits field
      return {
        ...data,
        plan_limits: data.plan_limits ? {
          max_videos_per_month: Number(data.plan_limits.max_videos_per_month),
          max_exports_per_month: Number(data.plan_limits.max_exports_per_month),
          max_duration_minutes: Number(data.plan_limits.max_duration_minutes),
          features: data.plan_limits.features as string[]
        } : null
      } as Subscription;
    },
  });
};