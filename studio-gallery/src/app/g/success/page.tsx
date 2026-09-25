import Link from 'next/link'
import { Camera, CheckCircle2 } from 'lucide-react'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-neutral-900">
            Lumeriq Visuals
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-neutral-900 text-white px-6 py-5 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
            <h1 className="text-lg font-semibold tracking-tight">
              Payment confirmed
            </h1>
            <p className="text-sm text-neutral-300 mt-1">
              Thank you for supporting Lumeriq Visuals
            </p>
          </div>

          <div className="px-6 py-6 space-y-4 text-sm">
            <p className="text-neutral-600 leading-relaxed">
              Your payment for photography products / services was successful.
              A confirmation has been sent by Stripe to the email used at
              checkout.
            </p>

            <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-4 space-y-2">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Studio
              </p>
              <p className="font-medium text-neutral-900">Lumeriq Visuals</p>
              <p className="text-neutral-500 text-xs">
                Photography &amp; visual storytelling
              </p>
            </div>

            {session_id && (
              <p className="text-xs text-neutral-400 break-all">
                Reference: {session_id}
              </p>
            )}

            <ul className="text-neutral-600 space-y-1.5 list-disc list-inside">
              <li>Digital downloads are processed shortly after payment</li>
              <li>Print orders are prepared and fulfilled by the studio</li>
              <li>Questions? Reply to your confirmation email</li>
            </ul>
          </div>

          <div className="px-6 pb-6">
            <Link
              href="/"
              className="flex items-center justify-center w-full rounded-lg bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
            >
              Back to Lumeriq Visuals
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
