import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { WebhookHandlerResult, SubscriptionData } from "../types.ts";

const getPlanLimits = (planName: string) => {
  console.log('Getting plan limits for:', planName);
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
  console.log('Getting plan name for price ID:', priceId);
  const priceMap: Record<string, string> = {
    'price_1QdIQ0G8TTdTbu7dSw6PTIQG': 'Starter',
    'price_1QdIQWG8TTdTbu7dpGfYO8qR': 'Pro',
    'price_1QdIR3G8TTdTbu7d797PglPe': 'Premium',
    'price_1QdIRgG8TTdTbu7d32x1RBaY': 'Starter',
    'price_1QdIS8G8TTdTbu7dTh5tOLpH': 'Pro',
    'price_1QdIScG8TTdTbu7duXhWR8Px': 'Premium',
  };
  const planName = priceMap[priceId] || 'Free';
  console.log('Mapped to plan name:', planName);
  return planName;
};

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing subscription update:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    metadata: subscription.metadata,
    items: subscription.items.data.map(item => ({
      price_id: item.price.id,
      quantity: item.quantity
    }))
  });
  
  try {
    const customerId = subscription.customer as string;
    const userId = subscription.metadata.user_id;
    
    if (!userId) {
      console.error('No user_id found in subscription metadata:', subscription.metadata);
      throw new Error('No user_id found in subscription metadata');
    }

    console.log('Found user ID:', userId);

    const planName = getPlanNameFromPrice(subscription.items.data[0].price.id);
    const planLimits = getPlanLimits(planName);
    
    const subscriptionData: Partial<SubscriptionData> = {
      user_id: userId,
      plan_name: planName,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      plan_limits: planLimits,
      payment_status: subscription.status === 'active' ? 'succeeded' : 'pending',
    };

    console.log('Attempting to update subscription data:', subscriptionData);

    const { error: updateError, data: updateData } = await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error updating subscription:', {
        error: updateError,
        context: 'Update operation',
        user_id: userId,
        subscription_id: subscription.id
      });
      throw updateError;
    }

    if (!updateData) {
      console.log('No existing subscription found, creating new one for user:', userId);
      const { error: insertError } = await supabaseAdmin
        .from('subscriptions')
        .insert([subscriptionData]);

      if (insertError) {
        console.error('Error inserting subscription:', {
          error: insertError,
          context: 'Insert operation',
          user_id: userId,
          subscription_id: subscription.id
        });
        throw insertError;
      }
    }

    if (subscription.status === 'active') {
      console.log('Resetting usage metrics for user:', userId);
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
        console.error('Error resetting usage metrics:', {
          error: usageError,
          user_id: userId
        });
      }
    }

    console.log('Successfully processed subscription update:', {
      user_id: userId,
      subscription_id: subscription.id,
      plan_name: planName,
      status: subscription.status
    });
    
    return {
      status: 'success',
      message: `Subscription ${subscription.id} updated successfully`,
    };
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', {
      error: error.message,
      stack: error.stack,
      subscription_id: subscription.id
    });
    throw error;
  }
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing subscription deletion:', {
    id: subscription.id,
    customer: subscription.customer,
    metadata: subscription.metadata
  });

  try {
    const userId = subscription.metadata.user_id;
    
    if (!userId) {
      console.error('No user_id found in subscription metadata for deletion');
      throw new Error('No user_id found in subscription metadata');
    }

    console.log('Processing subscription deletion for user:', userId);

    const subscriptionData = {
      user_id: userId,
      plan_name: 'Free',
      status: 'inactive',
      stripe_subscription_id: null,
      stripe_customer_id: null,
      plan_limits: {
        features: ["chatgpt_video"],
        max_duration_minutes: 10,
        max_videos_per_month: 20,
        max_exports_per_month: 10,
        max_voiceover_minutes: 10,
        max_ai_images: 50,
      },
      payment_status: 'cancelled',
      updated_at: new Date().toISOString(),
    };

    console.log('Updating subscription data for deletion:', {
      user_id: userId,
      subscription_id: subscription.id
    });

    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData);

    if (updateError) {
      console.error('Error updating subscription for deletion:', {
        error: updateError,
        user_id: userId,
        subscription_id: subscription.id
      });
      throw updateError;
    }

    console.log('Successfully processed subscription deletion:', {
      user_id: userId,
      subscription_id: subscription.id
    });
    
    return {
      status: 'success',
      message: `Subscription ${subscription.id} marked as cancelled`,
    };
  } catch (error) {
    console.error('Error handling subscription deletion:', {
      error: error.message,
      stack: error.stack,
      subscription_id: subscription.id
    });
    throw error;
  }
}