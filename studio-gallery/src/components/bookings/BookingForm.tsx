'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { Booking, BookingStatus, Client, Gallery } from '@/types/database'

const STATUSES: BookingStatus[] = ['inquiry', 'confirmed', 'completed', 'cancelled']

export function BookingForm({
  booking,
  clients,
  galleries,
}: {
  booking?: Booking
  clients: Client[]
  galleries: Gallery[]
}) {
  const router = useRouter()
  const isEdit = !!booking
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(booking?.title ?? '')
  const [clientId, setClientId] = useState(booking?.client_id ?? '')
  const [galleryId, setGalleryId] = useState(booking?.gallery_id ?? '')
  const [eventDate, setEventDate] = useState(booking?.event_date ?? '')
  const [location, setLocation] = useState(booking?.location ?? '')
  const [status, setStatus] = useState<BookingStatus>(booking?.status ?? 'inquiry')
  const [notes, setNotes] = useState(booking?.notes ?? '')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const payload = {
      title: title.trim(),
      client_id: clientId || null,
      gallery_id: galleryId || null,
      event_date: eventDate || null,
      location: location.trim() || null,
      status,
      notes: notes.trim() || null,
    }
    try {
      if (isEdit && booking) {
        const { error: err } = await supabase.from('bookings').update(payload).eq('id', booking.id)
        if (err) throw err
        router.push(`/admin/bookings/${booking.id}`)
      } else {
        const { data, error: err } = await supabase.from('bookings').insert(payload).select('id').single()
        if (err) throw err
        router.push(`/admin/bookings/${data.id}`)
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-xl">
      {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="Engagement session" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Client</label>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
          <option value="">— None —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Linked gallery</label>
        <select value={galleryId} onChange={(e) => setGalleryId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
          <option value="">— None —</option>
          {galleries.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Event date</label>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Location</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium border capitalize transition ${
                status === s
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <button type="submit" disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEdit ? 'Save changes' : 'Create booking'}
      </button>
    </form>
  )
}
