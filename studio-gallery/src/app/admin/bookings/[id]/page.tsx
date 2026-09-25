import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BookingForm } from '@/components/bookings/BookingForm'
import type { Booking, Client, Gallery } from '@/types/database'

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: booking }, { data: clients }, { data: galleries }] =
    await Promise.all([
      supabase.from('bookings').select('*').eq('id', id).single(),
      supabase.from('clients').select('*').order('name'),
      supabase.from('galleries').select('*').order('title'),
    ])
  if (!booking) notFound()
  return (
    <div>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6">
        <ChevronLeft className="w-4 h-4" /> Bookings
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-8">{booking.title}</h1>
      <BookingForm
        booking={booking as Booking}
        clients={(clients as Client[]) ?? []}
        galleries={(galleries as Gallery[]) ?? []}
      />
    </div>
  )
}
