import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ClientEditForm } from '@/components/clients/ClientEditForm'
import type { Client } from '@/types/database'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: client },
    { data: galleries },
    { data: bookings },
    { data: invoices },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('galleries').select('id, title, event_date, is_published, slug').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('bookings').select('id, title, event_date, status').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('id, invoice_number, status, amount_total, due_date').eq('client_id', id).order('created_at', { ascending: false }),
  ])

  if (!client) notFound()

  return (
    <div>
      <Link href="/admin/clients" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6">
        <ChevronLeft className="w-4 h-4" />
        Clients
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-8">
        {client.name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-medium text-neutral-900 mb-4">Contact</h2>
          <ClientEditForm client={client as Client} />
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-neutral-900 mb-3">Galleries</h2>
            {!galleries?.length ? (
              <p className="text-sm text-neutral-400">No galleries</p>
            ) : (
              <ul className="space-y-2">
                {galleries.map((g) => (
                  <li key={g.id}>
                    <Link href={`/admin/galleries/${g.id}`} className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm hover:border-neutral-300">
                      <span className="font-medium text-neutral-900">{g.title}</span>
                      <StatusBadge status={g.is_published ? 'published' : 'draft_gallery'} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-medium text-neutral-900 mb-3">Bookings</h2>
            {!bookings?.length ? (
              <p className="text-sm text-neutral-400">No bookings</p>
            ) : (
              <ul className="space-y-2">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link href={`/admin/bookings/${b.id}`} className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm hover:border-neutral-300">
                      <span>
                        <span className="font-medium text-neutral-900">{b.title}</span>
                        <span className="text-neutral-400 ml-2">{formatDate(b.event_date)}</span>
                      </span>
                      <StatusBadge status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-medium text-neutral-900 mb-3">Invoices</h2>
            {!invoices?.length ? (
              <p className="text-sm text-neutral-400">No invoices</p>
            ) : (
              <ul className="space-y-2">
                {invoices.map((inv) => (
                  <li key={inv.id}>
                    <Link href={`/admin/invoices/${inv.id}`} className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm hover:border-neutral-300">
                      <span>
                        <span className="font-medium text-neutral-900">{inv.invoice_number}</span>
                        <span className="text-neutral-400 ml-2">{formatCurrency(Number(inv.amount_total))}</span>
                      </span>
                      <StatusBadge status={inv.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
