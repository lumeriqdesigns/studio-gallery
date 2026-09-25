import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createClient(url, serviceKey)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata || {}

    if (meta.type === 'order' && meta.order_id) {
      await admin
        .from('orders')
        .update({
          status: 'paid',
          stripe_checkout_session_id: session.id,
        })
        .eq('id', meta.order_id)
    }
  }

  // Payment links for invoices use checkout.session.completed with metadata too
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata || {}
    if (meta.type === 'invoice' && meta.invoice_id) {
      await admin
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', meta.invoice_id)
    }
  }

  // Also handle payment_link payment via checkout
  if (event.type === 'checkout.session.completed') {
    // already handled above
  }

  return NextResponse.json({ received: true })
}
