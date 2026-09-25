import { createClient } from '@/lib/supabase/server'
import { BookingForm } from '@/components/bookings/BookingForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewBookingPage() {
  const supabase = await createClient()
  const [{ data: clients }, { data: galleries }] = await Promise.all([
    supabase.from('clients').select('*').order('name'),
    supabase.from('galleries').select('*').order('title'),
  ])
  return (
    <div>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6">
        <ChevronLeft className="w-4 h-4" /> Bookings
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-8">New booking</h1>
      <BookingForm clients={clients ?? []} galleries={galleries ?? []} />
    </div>
  )
}
