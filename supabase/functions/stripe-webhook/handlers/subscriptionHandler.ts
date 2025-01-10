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

const getPlanNameFromPrice = (priceId: string): string => {
  const priceMap: Record<string, string> = {
    'price_1QdIQ0G8TTdTbu7dSw6PTIQG': 'Starter',
    'price_1QdIQWG8TTdTbu7dpGfYO8qR': 'Pro',
    'price_1QdIR3G8TTdTbu7d797PglPe': 'Premium',
    'price_1QdIRgG8TTdTbu7d32x1RBaY': 'Starter',
    'price_1QdIS8G8TTdTbu7dTh5tOLpH': 'Pro',
    'price_1QdIScG8TTdTbu7duXhWR8Px': 'Premium',
  };
  return priceMap[priceId] || 'Free';
};

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing subscription update:', subscription.id);
  
  try {
    // Get the customer ID from the subscription
    const customerId = subscription.customer as string;
    
    // Get customer details to find the user
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.email) {
      throw new Error('No email found for customer');
    }

    // Find the user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', customer.email)
      .single();

    if (userError || !userData) {
      throw new Error(`User not found for email: ${customer.email}`);
    }

    const planName = getPlanNameFromPrice(subscription.items.data[0].price.id);
    const planLimits = getPlanLimits(planName);
    
    const subscriptionData: Partial<SubscriptionData> = {
      user_id: userData.id,
      plan_name: planName,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      plan_limits: planLimits,
      payment_status: subscription.status === 'active' ? 'succeeded' : 'pending',
    };

    console.log('Updating subscription with data:', subscriptionData);

    // Update or insert the subscription
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        ...subscriptionData,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw updateError;
    }

    // Reset usage if payment succeeded
    if (subscription.status === 'active') {
      await supabaseAdmin
        .from('user_usage')
        .upsert({
          user_id: userData.id,
          videos_created: 0,
          export_minutes_used: 0,
          voiceover_minutes_used: 0,
          ai_images_created: 0,
          month_start: new Date().toISOString().slice(0, 7) + '-01',
          updated_at: new Date().toISOString(),
        });
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
        status: 'active',
        updated_at: new Date().toISOString(),
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
        status: 'past_due',
        updated_at: new Date().toISOString(),
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