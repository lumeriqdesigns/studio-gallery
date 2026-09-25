import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { BookingStatus } from '@/types/database'

const STATUSES: (BookingStatus | 'all')[] = ['all', 'inquiry', 'confirmed', 'completed', 'cancelled']

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('bookings')
    .select('*, clients(name)')
    .order('event_date', { ascending: true, nullsFirst: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: bookings } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Bookings</h1>
          <p className="text-neutral-500 mt-1 text-sm">Session inquiries and confirmed shoots</p>
        </div>
        <Link href="/admin/bookings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-800 transition">
          <Plus className="w-4 h-4" />
          New booking
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === 'all' ? '/admin/bookings' : `/admin/bookings?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
              (status ?? 'all') === s
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </Link>
        ))}
      </div>

      {!bookings?.length ? (
        <EmptyState
          icon={Calendar}
          title="No bookings"
          description="Track session inquiries and confirmed shoots here."
          actionLabel="New booking"
          actionHref="/admin/bookings/new"
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Client</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium text-neutral-900 hover:underline">
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600 hidden sm:table-cell">
                    {(b.clients as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600 hidden md:table-cell">
                    {formatDate(b.event_date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
