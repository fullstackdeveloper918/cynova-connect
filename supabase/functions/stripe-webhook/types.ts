import Stripe from "https://esm.sh/stripe@14.21.0";

export interface WebhookHandlerResult {
  status: string;
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
}