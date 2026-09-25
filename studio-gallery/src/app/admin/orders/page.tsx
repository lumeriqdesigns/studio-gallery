import { createClient } from '@/lib/supabase/server'
import { ShoppingBag } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { MarkFulfilledButton } from '@/components/orders/MarkFulfilledButton'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, galleries(title), clients(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Orders</h1>
        <p className="text-neutral-500 mt-1 text-sm">Print and digital purchases from client galleries</p>
      </div>

      {!orders?.length ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Orders appear here when clients checkout from a gallery."
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Gallery</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="px-5 py-3.5 text-neutral-600">{formatDate(o.created_at)}</td>
                  <td className="px-5 py-3.5 text-neutral-600 hidden sm:table-cell">
                    {(o.galleries as { title: string } | null)?.title ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-neutral-900">
                    {formatCurrency(Number(o.amount_total))}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {o.status === 'paid' && (
                      <MarkFulfilledButton orderId={o.id} />
                    )}
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
