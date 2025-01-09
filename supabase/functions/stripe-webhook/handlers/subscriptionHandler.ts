import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { WebhookHandlerResult, SubscriptionData } from "../types.ts";

const getPlanLimits = (planName: string) => {
  const limits = {
    Starter: {
      features: ["chatgpt_video", "fake_text", "reddit_video", "split_video"],
      max_duration_minutes: 40,
      max_videos_per_month: 50,
      max_voiceover_minutes: 30,
      max_ai_images: 100,
      max_exports_per_month: 40,
    },
    Pro: {
      features: ["chatgpt_video", "fake_text", "reddit_video", "split_video"],
      max_duration_minutes: 120,
      max_videos_per_month: 100,
      max_voiceover_minutes: 150,
      max_ai_images: 300,
      max_exports_per_month: 80,
    },
    Premium: {
      features: ["chatgpt_video", "fake_text", "reddit_video", "split_video"],
      max_duration_minutes: 180,
      max_videos_per_month: 200,
      max_voiceover_minutes: 200,
      max_ai_images: 500,
      max_exports_per_month: 160,
    },
  };
  return limits[planName as keyof typeof limits] || limits.Starter;
};

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing subscription update:', subscription.id);
  
  try {
    const planName = getPlanNameFromPrice(subscription.items.data[0].price.id);
    const planLimits = getPlanLimits(planName);
    
    const subscriptionData: Partial<SubscriptionData> = {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      payment_status: subscription.status === 'active' ? 'succeeded' : 'pending',
      plan_limits: planLimits,
    };

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;

    // Reset usage if payment succeeded
    if (subscription.status === 'active') {
      await supabaseAdmin
        .from('user_usage')
        .update({
          videos_created: 0,
          export_minutes_used: 0,
          voiceover_minutes_used: 0,
          ai_images_created: 0,
        })
        .eq('user_id', subscription.metadata.user_id);
    }

    return {
      status: 'success',
      message: `Subscription ${subscription.id} updated successfully`,
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing successful payment:', paymentIntent.id);

  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        payment_status: 'succeeded',
        redirect_status: 'success'
      })
      .eq('stripe_subscription_id', paymentIntent.metadata.subscription_id);

    if (error) throw error;

    return {
      status: 'success',
      message: `Payment ${paymentIntent.id} processed successfully`,
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

export async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing failed payment:', paymentIntent.id);

  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        payment_status: 'failed',
        redirect_status: 'failed',
        status: 'past_due'
      })
      .eq('stripe_subscription_id', paymentIntent.metadata.subscription_id);

    if (error) throw error;

    return {
      status: 'success',
      message: `Payment failure ${paymentIntent.id} recorded`,
    };
  } catch (error) {
    console.error('Error processing payment failure:', error);
    throw error;
  }
}

function getPlanNameFromPrice(priceId: string): string {
  const priceMap: Record<string, string> = {
    'price_1QdIQ0G8TTdTbu7dSw6PTIQG': 'Starter',
    'price_1QdIQWG8TTdTbu7dpGfYO8qR': 'Pro',
    'price_1QdIR3G8TTdTbu7d797PglPe': 'Premium',
  };
  return priceMap[priceId] || 'Starter';
}