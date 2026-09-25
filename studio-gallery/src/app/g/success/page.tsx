import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Thank you!</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Your payment was successful. You&apos;ll receive a confirmation email from Stripe.
        </p>
        <Link href="/" className="text-sm font-medium text-neutral-900 underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
