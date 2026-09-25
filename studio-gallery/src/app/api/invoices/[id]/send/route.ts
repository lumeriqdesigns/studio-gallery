import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, clients(name, email)')
    .eq('id', id)
    .single()

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  try {
    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const amountCents = Math.round(Number(invoice.amount_total) * 100)

    // Use Checkout Session so we don't need pre-created Prices
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment for ${(invoice.clients as { name: string } | null)?.name ?? 'client'}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'invoice',
        invoice_id: invoice.id,
      },
      success_url: `${appUrl}/admin/invoices/${invoice.id}?paid=1`,
      cancel_url: `${appUrl}/admin/invoices/${invoice.id}`,
    })

    await supabase
      .from('invoices')
      .update({
        status: 'sent',
        stripe_payment_link: session.url,
      })
      .eq('id', id)

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
