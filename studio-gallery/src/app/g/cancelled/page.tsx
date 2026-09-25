import Link from 'next/link'

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Checkout cancelled</h1>
        <p className="text-sm text-neutral-500 mb-6">
          No charge was made. You can return to your gallery and try again.
        </p>
        <Link href="/" className="text-sm font-medium text-neutral-900 underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
