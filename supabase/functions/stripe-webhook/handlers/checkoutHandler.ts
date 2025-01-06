import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { WebhookHandlerResult, SubscriptionData } from "../types.ts";

const planMap: Record<string, string> = {
  'price_1QdIQ0G8TTdTbu7dSw6PTIQG': 'Starter',
  'price_1QdIQWG8TTdTbu7dpGfYO8qR': 'Pro',
  'price_1QdIR3G8TTdTbu7d797PglPe': 'Premium',
  'price_1QdIRgG8TTdTbu7d32x1RBaY': 'Starter',
  'price_1QdIS8G8TTdTbu7dTh5tOLpH': 'Pro',
  'price_1QdIScG8TTdTbu7duXhWR8Px': 'Premium',
};

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<WebhookHandlerResult> {
  console.log('Processing checkout.session.completed event');
  console.log('Session details:', {
    id: session.id,
    customer: session.customer,
    subscription: session.subscription,
    payment_status: session.payment_status,
  });

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Get customer's email
  console.log('Retrieving customer details for ID:', customerId);
  const customer = await stripe.customers.retrieve(customerId);
  const email = customer.email;
  
  if (!email) {
    console.error('No email found for customer:', customerId);
    throw new Error('No email found for customer');
  }
  console.log('Customer email found:', email);

  // Get user id from email
  console.log('Looking up user by email in Supabase...');
  const { data: userData, error: userError } = await supabaseAdmin
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    console.error('Error finding user:', userError || 'No user found');
    throw new Error(`User not found: ${userError?.message || 'No user data'}`);
  }
  console.log('Found user:', userData);

  // Get subscription details
  console.log('Retrieving subscription details for ID:', subscriptionId);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;
  console.log('Price ID from subscription:', priceId);

  const planName = planMap[priceId];
  if (!planName) {
    console.error('Unknown price ID:', priceId);
    throw new Error('Unknown price ID');
  }
  console.log('Mapped to plan name:', planName);

  // Prepare subscription data
  const subscriptionData: SubscriptionData = {
    user_id: userData.id,
    plan_name: planName,
    status: subscription.status,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  };
  console.log('Preparing to upsert subscription:', subscriptionData);

  // Update or insert subscription
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionData);

  if (subError) {
    console.error('Error upserting subscription:', subError);
    throw subError;
  }

  console.log('Successfully processed subscription for user:', userData.id);
  return {
    status: 'success',
    message: 'Subscription processed successfully',
    data: subscriptionData
  };
}