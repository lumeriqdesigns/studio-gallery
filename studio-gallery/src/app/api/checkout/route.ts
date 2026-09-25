import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import type { LineItem } from '@/types/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { galleryId, items } = body as {
      galleryId: string
      items: (LineItem & { photo_id?: string; product_id?: string })[]
    }

    if (!galleryId || !items?.length) {
      return NextResponse.json({ error: 'Invalid cart' }, { status: 400 })
    }

    const amount_total = items.reduce(
      (s, i) => s + i.quantity * i.unit_price,
      0
    )

    const supabase = await createClient()

    // Create pending order (public can create via service... use anon insert - RLS only allows admin)
    // For public checkout we need service role or a policy. Use service role if available.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!

    let orderId: string

    if (serviceKey) {
      const { createClient: createServiceClient } = await import('@supabase/supabase-js')
      const admin = createServiceClient(url, serviceKey)
      const { data: order, error } = await admin
        .from('orders')
        .insert({
          gallery_id: galleryId,
          status: 'pending',
          line_items: items,
          amount_total,
        })
        .select('id')
        .single()
      if (error) throw error
      orderId = order.id
    } else {
      // Fallback: authenticated admin only
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          gallery_id: galleryId,
          status: 'pending',
          line_items: items,
          amount_total,
        })
        .select('id')
        .single()
      if (error) throw error
      orderId = order.id
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.description,
          },
          unit_amount: Math.round(item.unit_price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        type: 'order',
        order_id: orderId,
        gallery_id: galleryId,
      },
      success_url: `${appUrl}/g/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/g/cancelled`,
    })

    // Store session id
    if (serviceKey) {
      const { createClient: createServiceClient } = await import('@supabase/supabase-js')
      const admin = createServiceClient(url, serviceKey)
      await admin
        .from('orders')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', orderId)
    } else {
      await supabase
        .from('orders')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', orderId)
    }

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    console.error('Checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
