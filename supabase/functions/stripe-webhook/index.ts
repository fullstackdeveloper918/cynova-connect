import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { handleCheckoutCompleted } from "./handlers/checkoutHandler.ts";
import { handleSubscriptionUpdated, handleSubscriptionDeleted } from "./handlers/subscriptionHandler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Webhook request received:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    console.log('Stripe signature received:', signature ? 'Yes' : 'No');
    
    if (!signature) {
      console.error('No Stripe signature found');
      throw new Error('No Stripe signature found');
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      throw new Error('Webhook secret not configured');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.text();
    console.log('Webhook body received:', body);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Event constructed successfully:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let result;
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed event');
        result = await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          stripe,
          supabaseAdmin
        );
        break;

      case 'customer.subscription.updated':
        console.log('Processing customer.subscription.updated event');
        result = await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          supabaseAdmin
        );
        break;

      case 'customer.subscription.deleted':
        console.log('Processing customer.subscription.deleted event');
        result = await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabaseAdmin
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({ received: true, message: `Unhandled event type: ${event.type}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Webhook processed successfully:', result);
    return new Response(
      JSON.stringify({ received: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});