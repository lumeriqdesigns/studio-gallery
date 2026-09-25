import { createClient } from '@/lib/supabase/server'
import { ClientGallery } from '@/components/gallery/ClientGallery'
import type { Gallery, Photo } from '@/types/database'

export default async function PublicGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: gallery } = await supabase
    .from('galleries')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Gallery not found
          </h1>
          <p className="text-sm text-neutral-500">
            This gallery doesn&apos;t exist or is no longer available.
          </p>
        </div>
      </div>
    )
  }

  const expired =
    gallery.expires_at && new Date(gallery.expires_at) < new Date()

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Gallery expired
          </h1>
          <p className="text-sm text-neutral-500">
            This gallery is no longer available. Contact the photographer if
            you need access.
          </p>
        </div>
      </div>
    )
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', gallery.id)
    .order('position')

  return (
    <ClientGallery
      gallery={gallery as Gallery}
      photos={(photos as Photo[]) ?? []}
      requiresPassword={!!gallery.password_hash}
    />
  )
}
