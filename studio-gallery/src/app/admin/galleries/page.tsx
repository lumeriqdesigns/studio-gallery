import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, ExternalLink, Copy } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Images } from 'lucide-react'
import { CopyLinkButton } from '@/components/gallery/CopyLinkButton'

export default async function GalleriesPage() {
  const supabase = await createClient()
  const { data: galleries } = await supabase
    .from('galleries')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Galleries
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Create and share client photo galleries
          </p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
        >
          <Plus className="w-4 h-4" />
          New gallery
        </Link>
      </div>

      {!galleries?.length ? (
        <EmptyState
          icon={Images}
          title="No galleries yet"
          description="Create your first client gallery and start uploading photos."
          actionLabel="New gallery"
          actionHref="/admin/galleries/new"
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Event</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Share link</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {galleries.map((g) => {
                  const shareUrl = `${appUrl}/g/${g.slug}`
                  return (
                    <tr
                      key={g.id}
                      className="border-b border-neutral-50 hover:bg-neutral-50/50 transition"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/galleries/${g.id}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {g.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600 hidden sm:table-cell">
                        {(g.clients as { name: string } | null)?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600 hidden md:table-cell">
                        {formatDate(g.event_date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={g.is_published ? 'published' : 'draft_gallery'}
                        />
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {g.is_published ? (
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs text-neutral-500 truncate max-w-[140px]">
                              /g/{g.slug}
                            </code>
                            <CopyLinkButton url={shareUrl} />
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400">Unpublished</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {g.is_published && (
                            <a
                              href={shareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                              title="View as client"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            href={`/admin/galleries/${g.id}`}
                            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
