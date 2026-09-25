'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { Client } from '@/types/database'

export function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(client.name)
  const [email, setEmail] = useState(client.email ?? '')
  const [phone, setPhone] = useState(client.phone ?? '')
  const [notes, setNotes] = useState(client.notes ?? '')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    const supabase = createClient()
    await supabase
      .from('clients')
      .update({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      })
      .eq('id', client.id)
    setLoading(false)
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={save} className="space-y-4 bg-white border border-neutral-200 rounded-xl p-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </button>
        {saved && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
    </form>
  )
}
