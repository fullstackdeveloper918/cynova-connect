import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { StripeEvent } from '../types.ts'

export async function handleSubscriptionChange(event: StripeEvent) {
  const subscription = event.data.object
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Get customer email from Stripe to match with our user
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
  })
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  const email = customer.email

  // Get user_id from email
  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !userData) {
    throw new Error('User not found')
  }

  const subscriptionData = {
    user_id: userData.id,
    plan_name: getPlanName(subscription.items.data[0].price.id),
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
  }

  // Update or insert subscription
  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData)

  if (upsertError) {
    throw upsertError
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

function getPlanName(priceId: string): string {
  // Map your Stripe price IDs to plan names
  const planMap: Record<string, string> = {
    'price_1QeDzGG8TTdTbu7dz9ApCJQM': 'Starter',
    'price_1QeDzcG8TTdTbu7d6fJJNFFQ': 'Pro',
    'price_1QeDzuG8TTdTbu7dosC1Ry4k': 'Premium',
  }
  return planMap[priceId] || 'Free'
}