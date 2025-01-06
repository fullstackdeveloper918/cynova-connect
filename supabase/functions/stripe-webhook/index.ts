import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Webhook received`);
  
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No stripe signature found in request headers');
      throw new Error('No signature found');
    }

    const body = await req.text();
    console.log('Request body received, length:', body.length);
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured in environment');
      throw new Error('Webhook secret not configured');
    }

    console.log('Attempting to construct Stripe event...');
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Event constructed successfully:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed event');
        const session = event.data.object as Stripe.Checkout.Session;
        
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

        if (userError) {
          console.error('Error finding user:', userError);
          throw new Error(`User not found: ${userError.message}`);
        }
        if (!userData) {
          console.error('No user found for email:', email);
          throw new Error('User not found in database');
        }
        console.log('Found user:', userData);

        // Get subscription details
        console.log('Retrieving subscription details for ID:', subscriptionId);
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        console.log('Price ID from subscription:', priceId);

        // Map price ID to plan name
        const planMap: Record<string, string> = {
          'price_1QdIQ0G8TTdTbu7dSw6PTIQG': 'Starter',
          'price_1QdIQWG8TTdTbu7dpGfYO8qR': 'Pro',
          'price_1QdIR3G8TTdTbu7d797PglPe': 'Premium',
          'price_1QdIRgG8TTdTbu7d32x1RBaY': 'Starter',
          'price_1QdIS8G8TTdTbu7dTh5tOLpH': 'Pro',
          'price_1QdIScG8TTdTbu7duXhWR8Px': 'Premium',
        };

        const planName = planMap[priceId];
        if (!planName) {
          console.error('Unknown price ID:', priceId);
          throw new Error('Unknown price ID');
        }
        console.log('Mapped to plan name:', planName);

        // Prepare subscription data
        const subscriptionData = {
          user_id: userData.id,
          plan_name: planName,
          status: 'active',
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
        break;
      }

      case 'customer.subscription.updated': {
        console.log('Processing subscription.updated event');
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer's email
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;
        if (!email) throw new Error('No email found for customer');

        // Get user id from email
        const { data: userData, error: userError } = await supabaseAdmin
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .single();

        if (userError || !userData) {
          throw new Error('User not found');
        }

        // Update subscription status
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) throw updateError;
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('Processing subscription.deleted event');
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status to canceled
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) throw updateError;
        break;
      }
    }

    const endTime = new Date().toISOString();
    console.log(`[${endTime}] Webhook processed successfully`);

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    const errorTime = new Date().toISOString();
    console.error(`[${errorTime}] Error processing webhook:`, err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});