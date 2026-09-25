'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function ClientSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        router.push(q.trim() ? `/admin/clients?q=${encodeURIComponent(q.trim())}` : '/admin/clients')
      }}
      className="relative max-w-sm"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />
    </form>
  )
}
