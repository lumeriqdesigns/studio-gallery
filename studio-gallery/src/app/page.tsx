import Link from 'next/link'
import { Camera } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-neutral-900 text-white mb-6">
          <Camera className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight mb-3">
          Studio Gallery
        </h1>
        <p className="text-neutral-500 text-base sm:text-lg mb-8 leading-relaxed">
          Client galleries, bookings, invoices, and more — built for
          photographers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Photographer login
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 px-6 py-3 text-sm font-medium hover:bg-neutral-50 transition"
          >
            Book a session
          </Link>
        </div>
      </div>
    </div>
  )
}
