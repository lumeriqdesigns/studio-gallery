import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <div className="min-h-screen surface-ink flex flex-col">
      <header className="border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-[var(--champagne)]/40 flex items-center justify-center">
            <span className="font-display text-[var(--champagne)] text-xs">L</span>
          </div>
          <span className="font-display text-base text-[var(--ivory)] tracking-wide">
            Lumeriq Visuals
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md card-luxe bg-[#141816] border-[var(--line)] overflow-hidden">
          <div className="px-8 pt-10 pb-6 text-center border-b border-white/5">
            <CheckCircle2 className="w-11 h-11 mx-auto mb-4 text-[var(--champagne)]" />
            <p className="eyebrow mb-2">Payment confirmed</p>
            <h1 className="font-display text-3xl text-[var(--ivory)]">
              Thank you
            </h1>
            <p className="text-sm text-[var(--stone-light)] mt-2 font-light">
              Your order with Lumeriq Visuals is confirmed
            </p>
          </div>

          <div className="px-8 py-6 space-y-4 text-sm text-[var(--stone-light)] font-light leading-relaxed">
            <p>
              A confirmation has been sent by Stripe to the email used at
              checkout.
            </p>
            <ul className="space-y-2 list-disc list-inside text-[var(--stone)]">
              <li>Digital downloads are processed shortly after payment</li>
              <li>Print orders are prepared and fulfilled by the studio</li>
              <li>Questions? Reply to your confirmation email</li>
            </ul>
            {session_id && (
              <p className="text-[0.65rem] text-[var(--stone)] break-all pt-2">
                Reference: {session_id}
              </p>
            )}
          </div>

          <div className="px-8 pb-8">
            <Link href="/" className="btn-primary w-full">
              Back to Lumeriq Visuals
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
