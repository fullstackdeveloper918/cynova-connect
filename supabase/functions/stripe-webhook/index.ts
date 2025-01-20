import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { handleCheckoutSession } from './handlers/checkoutHandler.ts'
import { handleSubscriptionChange } from './handlers/subscriptionHandler.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

console.log('Stripe webhook function loaded')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not set')
    return new Response(
      JSON.stringify({ error: 'Internal Server Error - Missing Stripe Key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  try {
    const signature = req.headers.get('stripe-signature')
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    console.log('Stripe signature:', signature)
    
    if (!signature) {
      console.error('No Stripe signature found in request headers')
      return new Response(
        JSON.stringify({ error: 'No Stripe signature found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.text()
    console.log('Received webhook body:', body)

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('Webhook event constructed successfully:', {
        type: event.type,
        id: event.id,
        object: event.object,
        api_version: event.api_version,
        created: new Date(event.created * 1000).toISOString(),
        data: {
          object: {
            id: event.data.object.id,
            object: event.data.object.object,
            metadata: event.data.object.metadata,
            status: event.data.object.status,
            customer: event.data.object.customer,
            subscription: event.data.object.subscription
          }
        }
      })
    } catch (err) {
      console.error('Error verifying webhook signature:', {
        error: err.message,
        signature: signature,
        body: body.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      })
      return new Response(
        JSON.stringify({ 
          error: `Webhook signature verification failed`,
          details: err.message,
          timestamp: new Date().toISOString()
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing webhook event:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    })

    let result;
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed event')
        result = await handleCheckoutSession(event.data.object)
        console.log('Checkout session processing result:', result)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log(`Processing ${event.type} event`)
        result = await handleSubscriptionChange(event.data.object)
        console.log('Subscription change processing result:', result)
        break
      default:
        console.log('Unhandled event type:', event.type)
    }

    console.log('Successfully processed webhook event:', event.type)
    return new Response(
      JSON.stringify({ 
        received: true,
        event_type: event.type,
        timestamp: new Date().toISOString(),
        processing_result: result
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Error processing webhook:', {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    })
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: err.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})