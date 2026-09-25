import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { InvoiceStatus } from '@/types/database'

const STATUSES: (InvoiceStatus | 'all')[] = ['all', 'draft', 'sent', 'paid', 'overdue', 'void']

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()
  let query = supabase
    .from('invoices')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  const { data: invoices } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Invoices</h1>
          <p className="text-neutral-500 mt-1 text-sm">Create and track client invoices</p>
        </div>
        <Link href="/admin/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-800">
          <Plus className="w-4 h-4" /> New invoice
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => (
          <Link key={s}
            href={s === 'all' ? '/admin/invoices' : `/admin/invoices?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium border capitalize ${
              (status ?? 'all') === s
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200'
            }`}>
            {s === 'all' ? 'All' : s}
          </Link>
        ))}
      </div>
      {!invoices?.length ? (
        <EmptyState icon={FileText} title="No invoices" description="Create invoices and collect payment via Stripe."
          actionLabel="New invoice" actionHref="/admin/invoices/new" />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-5 py-3 font-medium">Number</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Client</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-neutral-900 hover:underline">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600 hidden sm:table-cell">
                    {(inv.clients as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-900">{formatCurrency(Number(inv.amount_total))}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3.5 text-neutral-500 hidden md:table-cell">{formatDate(inv.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
