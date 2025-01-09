export interface WebhookHandlerResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export interface SubscriptionData {
  user_id: string;
  plan_name: string;
  status: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  current_period_start: string;
  current_period_end: string;
  plan_limits: {
    features: string[];
    max_duration_minutes: number;
    max_videos_per_month: number;
    max_exports_per_month: number;
    max_voiceover_minutes: number;
    max_ai_images: number;
  };
}