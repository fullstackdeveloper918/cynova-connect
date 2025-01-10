import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { handleCheckoutCompleted } from "./handlers/checkoutHandler.ts";
import { handleSubscriptionUpdated, handlePaymentSucceeded, handlePaymentFailed } from "./handlers/subscriptionHandler.ts";
import { WebhookHandlerResult } from "./types.ts";

serve(async (req) => {
  try {
    console.log("Received webhook request");
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No Stripe signature found");
      throw new Error("No Stripe signature found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      throw new Error("Webhook secret not configured");
    }

    const body = await req.text();
    console.log("Webhook body:", body);
    
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 400 });
    }

    console.log(`Processing Stripe webhook event: ${event.type}`, event);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    let result: WebhookHandlerResult;

    switch (event.type) {
      case "checkout.session.completed":
        console.log("Processing checkout.session.completed");
        result = await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          stripe,
          supabaseAdmin
        );
        break;

      case "customer.subscription.updated":
        console.log("Processing customer.subscription.updated");
        result = await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          supabaseAdmin
        );
        break;

      case "payment_intent.succeeded":
        console.log("Processing payment_intent.succeeded");
        result = await handlePaymentSucceeded(
          event.data.object as Stripe.PaymentIntent,
          supabaseAdmin
        );
        break;

      case "payment_intent.payment_failed":
        console.log("Processing payment_intent.payment_failed");
        result = await handlePaymentFailed(
          event.data.object as Stripe.PaymentIntent,
          supabaseAdmin
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({ received: true, handled: false }),
          { status: 200 }
        );
    }

    console.log(`Successfully processed ${event.type}:`, result);
    return new Response(JSON.stringify({ received: true, handled: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process webhook" }),
      { status: 400 }
    );
  }
});