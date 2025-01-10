import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received webhook request')
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Webhook secret not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    const body = await req.text()
    console.log('Webhook body received:', body)

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
      console.log('Event constructed successfully:', event.type)
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Processing checkout.session.completed:', session.id)
        
        // Get customer details
        const customer = await stripe.customers.retrieve(session.customer)
        console.log('Customer details:', customer)

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        console.log('Subscription details:', subscription)

        const planName = subscription.items.data[0].price.nickname || 'Pro'
        console.log('Plan name:', planName)

        // Update or create subscription in database
        const { data: existingSubscription, error: fetchError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.metadata?.user_id)
          .maybeSingle()

        if (fetchError) {
          console.error('Error fetching existing subscription:', fetchError)
          throw fetchError
        }

        const subscriptionData = {
          user_id: session.metadata?.user_id,
          plan_name: planName,
          status: 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          payment_status: session.payment_status,
        }

        if (existingSubscription) {
          console.log('Updating existing subscription for user:', session.metadata?.user_id)
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('id', existingSubscription.id)

          if (updateError) {
            console.error('Error updating subscription:', updateError)
            throw updateError
          }
        } else {
          console.log('Creating new subscription for user:', session.metadata?.user_id)
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert([subscriptionData])

          if (insertError) {
            console.error('Error inserting subscription:', insertError)
            throw insertError
          }
        }

        console.log('Subscription processed successfully')
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('Processing customer.subscription.updated:', subscription.id)

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          throw updateError
        }

        console.log('Subscription updated successfully')
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('Processing customer.subscription.deleted:', subscription.id)

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan_name: 'Free'
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          throw updateError
        }

        console.log('Subscription marked as canceled successfully')
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: { message: err.message } }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})