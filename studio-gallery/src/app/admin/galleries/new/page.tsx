import { createClient } from '@/lib/supabase/server'
import { GalleryForm } from '@/components/gallery/GalleryForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewGalleryPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  return (
    <div>
      <Link
        href="/admin/galleries"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Galleries
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-8">
        New gallery
      </h1>
      <GalleryForm clients={clients ?? []} />
    </div>
  )
}
