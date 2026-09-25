'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, X, GripVertical } from 'lucide-react'
import type { Photo } from '@/types/database'
import { useRouter } from 'next/navigation'

type UploadItem = {
  id: string
  file: File
  progress: number
  error?: string
}

async function makeThumbnail(file: File, maxSize = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject(new Error('Thumbnail failed'))
        },
        'image/jpeg',
        0.8
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image load failed'))
    }
    img.src = url
  })
}

function photoPublicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/gallery-photos/${path}`
}

export function PhotoUploader({
  galleryId,
  photos: initialPhotos,
}: {
  galleryId: string
  photos: Photo[]
}) {
  const router = useRouter()
  const [photos, setPhotos] = useState(initialPhotos)
  const [queue, setQueue] = useState<UploadItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [reordering, setReordering] = useState(false)

  const uploadFile = async (file: File, position: number) => {
    const supabase = createClient()
    const id = crypto.randomUUID()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `${galleryId}/${id}.${ext}`
    const thumbPath = `${galleryId}/thumbs/${id}.jpg`

    setQueue((q) => [...q, { id, file, progress: 10 }])

    try {
      const { error: upErr } = await supabase.storage
        .from('gallery-photos')
        .upload(storagePath, file, { cacheControl: '3600', upsert: false })
      if (upErr) throw upErr

      setQueue((q) =>
        q.map((i) => (i.id === id ? { ...i, progress: 50 } : i))
      )

      let thumbnail_path: string | null = null
      try {
        const thumb = await makeThumbnail(file)
        await supabase.storage
          .from('gallery-photos')
          .upload(thumbPath, thumb, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          })
        thumbnail_path = thumbPath
      } catch {
        // thumbnail optional
      }

      setQueue((q) =>
        q.map((i) => (i.id === id ? { ...i, progress: 80 } : i))
      )

      const { data: row, error: dbErr } = await supabase
        .from('photos')
        .insert({
          gallery_id: galleryId,
          storage_path: storagePath,
          thumbnail_path,
          position,
        })
        .select()
        .single()
      if (dbErr) throw dbErr

      setPhotos((p) => [...p, row as Photo])
      setQueue((q) => q.filter((i) => i.id !== id))

      // Set cover if first photo
      if (position === 0) {
        await supabase
          .from('galleries')
          .update({
            cover_photo_url: thumbnail_path || storagePath,
          })
          .eq('id', galleryId)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setQueue((q) =>
        q.map((i) => (i.id === id ? { ...i, progress: 0, error: msg } : i))
      )
    }
  }

  const onFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      const startPos =
        photos.length > 0
          ? Math.max(...photos.map((p) => p.position)) + 1
          : 0
      for (let i = 0; i < list.length; i++) {
        await uploadFile(list[i], startPos + i)
      }
      router.refresh()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photos, galleryId]
  )

  const deletePhoto = async (photo: Photo) => {
    const supabase = createClient()
    await supabase.storage.from('gallery-photos').remove(
      [photo.storage_path, photo.thumbnail_path].filter(Boolean) as string[]
    )
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos((p) => p.filter((x) => x.id !== photo.id))
    router.refresh()
  }

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const next = index + direction
    if (next < 0 || next >= photos.length) return
    setReordering(true)
    const arranged = [...photos]
    const tmp = arranged[index]
    arranged[index] = arranged[next]
    arranged[next] = tmp
    const withPos = arranged.map((p, i) => ({ ...p, position: i }))
    setPhotos(withPos)
    const supabase = createClient()
    await Promise.all(
      withPos.map((p) =>
        supabase.from('photos').update({ position: p.position }).eq('id', p.id)
      )
    )
    setReordering(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          dragging
            ? 'border-neutral-900 bg-neutral-50'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
        <p className="text-sm text-neutral-600 mb-2">
          Drag & drop photos here, or
        </p>
        <label className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 cursor-pointer transition">
          Choose files
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && onFiles(e.target.files)}
          />
        </label>
      </div>

      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-2 text-sm"
            >
              {item.error ? (
                <span className="text-red-600 flex-1 truncate">
                  {item.file.name}: {item.error}
                </span>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  <span className="flex-1 truncate text-neutral-600">
                    {item.file.name}
                  </span>
                  <span className="text-neutral-400">{item.progress}%</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-900">
              {photos.length} photo{photos.length !== 1 ? 's' : ''}
              {reordering && (
                <span className="text-neutral-400 font-normal ml-2">
                  Saving order…
                </span>
              )}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((photo, index) => {
                const src = photoPublicUrl(
                  photo.thumbnail_path || photo.storage_path
                )
                return (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => movePhoto(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded bg-white/90 text-neutral-700 disabled:opacity-30"
                        title="Move earlier"
                      >
                        <GripVertical className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 1)}
                        disabled={index === photos.length - 1}
                        className="p-1.5 rounded bg-white/90 text-neutral-700 disabled:opacity-30"
                        title="Move later"
                      >
                        <GripVertical className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePhoto(photo)}
                        className="p-1.5 rounded bg-white/90 text-red-600"
                        title="Delete"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
