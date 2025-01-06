export interface PlanLimits {
  features: string[];
  max_duration_minutes: number;
  max_videos_per_month: number;
  max_exports_per_month: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string | null;
  created_at: string | null;
  updated_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan_limits: PlanLimits;
}