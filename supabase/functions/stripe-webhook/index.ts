import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { handleCheckoutCompleted } from "./handlers/checkoutHandler.ts";
import { handleSubscriptionUpdated, handleSubscriptionDeleted } from "./handlers/subscriptionHandler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Webhook received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    console.log('Attempting to construct Stripe event...');
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Error constructing event:', err);
      return new Response(
        JSON.stringify({
          error: 'Webhook Error',
          details: err.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Event constructed successfully:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    let result;
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          result = await handleCheckoutCompleted(
            event.data.object,
            stripe,
            supabaseAdmin
          );
          break;
        case 'customer.subscription.updated':
          result = await handleSubscriptionUpdated(
            event.data.object,
            supabaseAdmin
          );
          break;
        case 'customer.subscription.deleted':
          result = await handleSubscriptionDeleted(
            event.data.object,
            supabaseAdmin
          );
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
          result = { status: 'success', message: 'Unhandled event type' };
      }

      const endTime = new Date().toISOString();
      console.log(`[${endTime}] Webhook processed successfully:`, result);

      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return new Response(
        JSON.stringify({
          error: 'Webhook processing failed',
          details: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (err) {
    const errorTime = new Date().toISOString();
    console.error(`[${errorTime}] Error processing webhook:`, err);
    return new Response(
      JSON.stringify({ 
        error: err.message,
        details: err.stack,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});