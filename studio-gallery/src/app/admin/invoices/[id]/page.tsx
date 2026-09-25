import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import { SendInvoiceButton } from '@/components/invoices/SendInvoiceButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Client, Invoice } from '@/types/database'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: invoice }, { data: clients }] = await Promise.all([
    supabase.from('invoices').select('*, clients(name, email)').eq('id', id).single(),
    supabase.from('clients').select('*').order('name'),
  ])
  if (!invoice) notFound()

  return (
    <div>
      <Link href="/admin/invoices" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6">
        <ChevronLeft className="w-4 h-4" /> Invoices
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            {invoice.invoice_number}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={invoice.status} />
            <span className="text-sm text-neutral-500">
              {formatCurrency(Number(invoice.amount_total))}
              {invoice.due_date ? ` · due ${formatDate(invoice.due_date)}` : ''}
            </span>
          </div>
          {invoice.stripe_payment_link && (
            <p className="text-xs text-neutral-400 mt-2 break-all">
              Payment link:{' '}
              <a href={invoice.stripe_payment_link} target="_blank" rel="noopener noreferrer" className="underline">
                {invoice.stripe_payment_link}
              </a>
            </p>
          )}
        </div>
        {(invoice.status === 'draft' || invoice.status === 'sent') && (
          <SendInvoiceButton invoiceId={invoice.id} status={invoice.status} />
        )}
      </div>
      <InvoiceForm invoice={invoice as Invoice} clients={(clients as Client[]) ?? []} />
    </div>
  )
}
