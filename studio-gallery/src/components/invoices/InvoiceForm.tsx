'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { Client, Invoice, LineItem } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

export function InvoiceForm({
  invoice,
  clients,
}: {
  invoice?: Invoice
  clients: Client[]
}) {
  const router = useRouter()
  const isEdit = !!invoice
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientId, setClientId] = useState(invoice?.client_id ?? '')
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? '')
  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice?.line_items?.length
      ? invoice.line_items
      : [{ description: '', quantity: 1, unit_price: 0 }]
  )

  const total = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const updateItem = (idx: number, patch: Partial<LineItem>) => {
    setLineItems((items) => items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      setError('Client is required')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    try {
      if (isEdit && invoice) {
        const { error: err } = await supabase
          .from('invoices')
          .update({
            client_id: clientId,
            due_date: dueDate || null,
            line_items: lineItems,
            amount_total: total,
          })
          .eq('id', invoice.id)
        if (err) throw err
        router.push(`/admin/invoices/${invoice.id}`)
      } else {
        const invoice_number = `INV-${Date.now().toString(36).toUpperCase()}`
        const { data, error: err } = await supabase
          .from('invoices')
          .insert({
            client_id: clientId,
            invoice_number,
            due_date: dueDate || null,
            line_items: lineItems,
            amount_total: total,
            status: 'draft',
          })
          .select('id')
          .single()
        if (err) throw err
        router.push(`/admin/invoices/${data.id}`)
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Client</label>
        <select required value={clientId} onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Due date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">Line items</label>
          <button type="button"
            onClick={() => setLineItems((i) => [...i, { description: '', quantity: 1, unit_price: 0 }])}
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900">
            <Plus className="w-3.5 h-3.5" /> Add line
          </button>
        </div>
        <div className="space-y-2">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 items-start">
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                required
              />
              <input
                type="number" min={1} step={1}
                value={item.quantity}
                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                className="w-20 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                type="number" min={0} step={0.01}
                value={item.unit_price}
                onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                className="w-28 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                placeholder="Price"
              />
              <button type="button" onClick={() => setLineItems((items) => items.filter((_, i) => i !== idx))}
                className="p-2 text-neutral-400 hover:text-red-600" disabled={lineItems.length === 1}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-right text-sm font-semibold text-neutral-900 mt-3">
          Total: {formatCurrency(total)}
        </p>
      </div>
      <button type="submit" disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEdit ? 'Save invoice' : 'Create invoice'}
      </button>
    </form>
  )
}
