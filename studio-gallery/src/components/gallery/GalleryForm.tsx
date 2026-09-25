'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify, hashPassword } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { Client, Gallery } from '@/types/database'

type Props = {
  gallery?: Gallery
  clients: Client[]
}

export function GalleryForm({ gallery, clients }: Props) {
  const router = useRouter()
  const isEdit = !!gallery
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(gallery?.title ?? '')
  const [slug, setSlug] = useState(gallery?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!gallery)
  const [clientId, setClientId] = useState(gallery?.client_id ?? '')
  const [newClientName, setNewClientName] = useState('')
  const [eventDate, setEventDate] = useState(gallery?.event_date ?? '')
  const [isPublished, setIsPublished] = useState(gallery?.is_published ?? false)
  const [allowDownloads, setAllowDownloads] = useState(gallery?.allow_downloads ?? false)
  const [maxDownloads, setMaxDownloads] = useState(
    gallery?.max_downloads != null ? String(gallery.max_downloads) : ''
  )
  const [password, setPassword] = useState('')
  const [clearPassword, setClearPassword] = useState(false)
  const [expiresAt, setExpiresAt] = useState(
    gallery?.expires_at ? gallery.expires_at.slice(0, 10) : ''
  )

  const onTitleChange = (v: string) => {
    setTitle(v)
    if (!slugManual) setSlug(slugify(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      let resolvedClientId = clientId || null

      if (!resolvedClientId && newClientName.trim()) {
        const { data: newClient, error: cErr } = await supabase
          .from('clients')
          .insert({ name: newClientName.trim() })
          .select('id')
          .single()
        if (cErr) throw cErr
        resolvedClientId = newClient.id
      }

      // Ensure unique slug
      let finalSlug = slugify(slug || title)
      if (!finalSlug) throw new Error('Slug is required')

      const { data: existing } = await supabase
        .from('galleries')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle()

      if (existing && existing.id !== gallery?.id) {
        finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`
      }

      let password_hash: string | null = gallery?.password_hash ?? null
      if (clearPassword) password_hash = null
      else if (password.trim()) password_hash = await hashPassword(password.trim())

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        client_id: resolvedClientId,
        event_date: eventDate || null,
        is_published: isPublished,
        allow_downloads: allowDownloads,
        max_downloads: maxDownloads.trim() === '' ? null : Math.max(0, parseInt(maxDownloads, 10) || 0),
        password_hash,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      }

      if (isEdit && gallery) {
        const { error: uErr } = await supabase
          .from('galleries')
          .update(payload)
          .eq('id', gallery.id)
        if (uErr) throw uErr
        router.push(`/admin/galleries/${gallery.id}`)
      } else {
        const { data: created, error: iErr } = await supabase
          .from('galleries')
          .insert(payload)
          .select('id')
          .single()
        if (iErr) throw iErr
        router.push(`/admin/galleries/${created.id}`)
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Title
        </label>
        <input
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          placeholder="Smith Wedding"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          URL slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">/g/</span>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugManual(true)
              setSlug(slugify(e.target.value) || e.target.value)
            }}
            className="flex-1 rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Client
        </label>
        <select
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value)
            if (e.target.value) setNewClientName('')
          }}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent mb-2"
        >
          <option value="">— Select or create new —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.email ? ` (${c.email})` : ''}
            </option>
          ))}
        </select>
        {!clientId && (
          <input
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="Or type a new client name"
            className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Event date
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="published"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="rounded border-neutral-300"
        />
        <label htmlFor="published" className="text-sm text-neutral-700">
          Published (visible via share link)
        </label>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
        <p className="text-sm font-medium text-neutral-900">Client access</p>
        <div className="flex items-start gap-3">
          <input
            id="allowDownloads"
            type="checkbox"
            checked={allowDownloads}
            onChange={(e) => setAllowDownloads(e.target.checked)}
            className="rounded border-neutral-300 mt-0.5"
          />
          <label htmlFor="allowDownloads" className="text-sm text-neutral-700">
            <span className="font-medium">Allow downloads</span>
            <span className="block text-neutral-500 mt-0.5">
              Off = preview &amp; selections only (proofing). On = clients can download full photos.
            </span>
          </label>
        </div>
        {allowDownloads && (
          <div>
            <label htmlFor="maxDownloads" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Max downloads (optional)
            </label>
            <input
              id="maxDownloads"
              type="number"
              min={1}
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              placeholder="Unlimited"
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Leave blank for unlimited. Example: 20 lets the client download up to 20 photos.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Password protect {gallery?.password_hash ? '(set — leave blank to keep)' : '(optional)'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank for none"
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
        {gallery?.password_hash && (
          <label className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={clearPassword}
              onChange={(e) => setClearPassword(e.target.checked)}
            />
            Remove password protection
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Expiry date (optional)
        </label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60 transition"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create gallery'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
