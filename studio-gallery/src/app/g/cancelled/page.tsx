import Link from 'next/link'
import { Camera } from 'lucide-react'

export default function CheckoutCancelledPage() {
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
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Checkout cancelled
          </h1>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            No charge was made. You can return to your gallery and try again
            whenever you&apos;re ready.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Back to Lumeriq Visuals
          </Link>
        </div>
      </main>
    </div>
  )
}
