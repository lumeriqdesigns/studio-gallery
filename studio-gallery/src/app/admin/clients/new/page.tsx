'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('clients')
      .insert({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      })
      .select('id')
      .single()
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push(`/admin/clients/${data.id}`)
    router.refresh()
  }

  return (
    <div>
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Clients
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-8">
        Add client
      </h1>
      <form onSubmit={submit} className="space-y-5 max-w-md">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
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
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save client
        </button>
      </form>
    </div>
  )
}
