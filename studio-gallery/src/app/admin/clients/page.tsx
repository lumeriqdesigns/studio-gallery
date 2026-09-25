import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { ClientSearch } from '@/components/clients/ClientSearch'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('clients')
    .select('*, galleries(count)')
    .order('created_at', { ascending: false })

  if (q?.trim()) {
    query = query.or(`name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`)
  }

  const { data: clients } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Clients
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            CRM for your photography clients
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
        >
          <Plus className="w-4 h-4" />
          Add client
        </Link>
      </div>

      <ClientSearch initialQuery={q ?? ''} />

      {!clients?.length ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Clients are created when you add a gallery or booking, or add them here."
          actionLabel="Add client"
          actionHref="/admin/clients/new"
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Phone</th>
                <th className="px-5 py-3 font-medium">Galleries</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Added</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const count =
                  (c.galleries as { count: number }[] | null)?.[0]?.count ?? 0
                return (
                  <tr
                    key={c.id}
                    className="border-b border-neutral-50 hover:bg-neutral-50/50"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 hidden sm:table-cell">
                      {c.email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 hidden md:table-cell">
                      {c.phone ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">{count}</td>
                    <td className="px-5 py-3.5 text-neutral-500 hidden lg:table-cell">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
