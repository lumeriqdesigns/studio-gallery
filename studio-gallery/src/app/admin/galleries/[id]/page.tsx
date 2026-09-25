import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { GalleryForm } from '@/components/gallery/GalleryForm'
import { PhotoUploader } from '@/components/gallery/PhotoUploader'
import { CopyLinkButton } from '@/components/gallery/CopyLinkButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Gallery, Photo, Client } from '@/types/database'

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: gallery }, { data: photos }, { data: clients }] =
    await Promise.all([
      supabase.from('galleries').select('*').eq('id', id).single(),
      supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', id)
        .order('position'),
      supabase.from('clients').select('*').order('name'),
    ])

  if (!gallery) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const shareUrl = `${appUrl}/g/${gallery.slug}`

  return (
    <div>
      <Link
        href="/admin/galleries"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Galleries
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            {gallery.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge
              status={gallery.is_published ? 'published' : 'draft_gallery'}
            />
            {gallery.is_published && (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">
                  /g/{gallery.slug}
                </code>
                <CopyLinkButton url={shareUrl} />
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-neutral-400 hover:text-neutral-700"
                  title="View as client"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-sm font-medium text-neutral-900 mb-4">
            Gallery settings
          </h2>
          <GalleryForm
            gallery={gallery as Gallery}
            clients={(clients as Client[]) ?? []}
          />
        </div>
        <div>
          <h2 className="text-sm font-medium text-neutral-900 mb-4">Photos</h2>
          <PhotoUploader
            galleryId={id}
            photos={(photos as Photo[]) ?? []}
          />
        </div>
      </div>
    </div>
  )
}
