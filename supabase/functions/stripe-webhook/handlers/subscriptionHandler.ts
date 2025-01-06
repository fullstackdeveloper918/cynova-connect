import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { WebhookHandlerResult } from "../types.ts";

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing subscription.updated event');
  console.log('Subscription details:', {
    id: subscription.id,
    status: subscription.status,
    customer: subscription.customer
  });

  // Update subscription status
  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    throw updateError;
  }
  
  console.log('Successfully updated subscription:', subscription.id);
  return { 
    status: 'success',
    message: 'Subscription updated successfully'
  };
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing subscription.deleted event');
  console.log('Subscription ID:', subscription.id);
  
  // Update subscription status to canceled
  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error marking subscription as canceled:', updateError);
    throw updateError;
  }
  
  console.log('Successfully marked subscription as canceled:', subscription.id);
  return { 
    status: 'success',
    message: 'Subscription marked as canceled'
  };
}