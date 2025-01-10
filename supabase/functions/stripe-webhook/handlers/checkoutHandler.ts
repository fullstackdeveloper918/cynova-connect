import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { WebhookHandlerResult, SubscriptionData } from "../types.ts";

const planMap: Record<string, string> = {
  'price_1QeDzGG8TTdTbu7dz9ApCJQM': 'Starter',  // Test Monthly
  'price_1QeDzuG8TTdTbu7dosC1Ry4k': 'Starter',  // Test Yearly
  'price_1QeDzcG8TTdTbu7d6fJJNFFQ': 'Pro',      // Test Monthly
  'price_1QeDzuG8TTdTbu7dosC1Ry4k': 'Pro',      // Test Yearly
  'price_1QeDzuG8TTdTbu7dosC1Ry4k': 'Premium',  // Test Monthly
  'price_1QeDzuG8TTdTbu7dosC1Ry4k': 'Premium',  // Test Yearly
};

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

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  try {
    console.log('Processing checkout.session.completed:', {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata,
    });

    if (!session.customer || !session.subscription) {
      throw new Error('Missing customer or subscription ID');
    }

    // Get subscription details to determine the plan
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log('Subscription retrieved:', subscription.id);

    const priceId = subscription.items.data[0].price.id;
    const planName = planMap[priceId];
    
    if (!planName) {
      console.error('Unknown price ID:', priceId);
      throw new Error('Unknown price ID');
    }

    console.log('Mapped to plan:', planName);

    // Get user ID from metadata
    const userId = session.metadata?.user_id;
    if (!userId) {
      throw new Error('No user_id found in session metadata');
    }

    // Prepare subscription data
    const subscriptionData: SubscriptionData = {
      user_id: userId,
      plan_name: planName,
      status: subscription.status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      plan_limits: getPlanLimits(planName),
      payment_status: session.payment_status,
    };

    console.log('Updating subscription in database:', subscriptionData);

    // Update or insert subscription
    const { error: upsertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData);

    if (upsertError) {
      console.error('Error upserting subscription:', upsertError);
      throw upsertError;
    }

    // Reset usage metrics for the new billing period
    const { error: usageError } = await supabaseAdmin
      .from('user_usage')
      .upsert({
        user_id: userId,
        videos_created: 0,
        export_minutes_used: 0,
        voiceover_minutes_used: 0,
        ai_images_created: 0,
        month_start: new Date().toISOString().slice(0, 7) + '-01',
        updated_at: new Date().toISOString(),
      });

    if (usageError) {
      console.error('Error resetting usage metrics:', usageError);
    }

    console.log('Successfully processed subscription for user:', userId);
    return {
      status: 'success',
      message: 'Subscription processed successfully',
      data: subscriptionData
    };
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
    throw error;
  }
}