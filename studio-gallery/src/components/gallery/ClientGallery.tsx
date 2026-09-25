'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
} from 'lucide-react'
import type { Gallery, Photo } from '@/types/database'
import { PRINT_PRODUCTS } from '@/types/database'
import { verifyPassword, formatCurrency } from '@/lib/utils'
import { WatermarkedImage } from '@/components/gallery/WatermarkedImage'

function photoUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/gallery-photos/${path}`
}

type CartItem = {
  photoId: string
  productId: string
  productName: string
  price: number
  quantity: number
}

function loadDownloadedIds(slug: string): Set<string> {
  try {
    const raw = localStorage.getItem(`gallery-dl-${slug}`)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveDownloadedIds(slug: string, ids: Set<string>) {
  localStorage.setItem(`gallery-dl-${slug}`, JSON.stringify([...ids]))
}

export function ClientGallery({
  gallery,
  photos,
  requiresPassword,
}: {
  gallery: Gallery
  photos: Photo[]
  requiresPassword: boolean
}) {
  const [unlocked, setUnlocked] = useState(!requiresPassword)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const allowDownloads = gallery.allow_downloads === true
  const maxDownloads =
    gallery.max_downloads != null && gallery.max_downloads > 0
      ? gallery.max_downloads
      : null
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set())
  const [dlMessage, setDlMessage] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Proofing (downloads off): watermark previews. Downloads on: clean previews.
  const showWatermark = !allowDownloads

  useEffect(() => {
    if (!requiresPassword) return
    const key = `gallery-unlock-${gallery.slug}`
    if (sessionStorage.getItem(key) === '1') setUnlocked(true)
  }, [gallery.slug, requiresPassword])

  useEffect(() => {
    setDownloadedIds(loadDownloadedIds(gallery.slug))
  }, [gallery.slug])

  const remainingDownloads =
    maxDownloads != null
      ? Math.max(0, maxDownloads - downloadedIds.size)
      : null

  const tryUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gallery.password_hash) return
    const ok = await verifyPassword(password, gallery.password_hash)
    if (ok) {
      sessionStorage.setItem(`gallery-unlock-${gallery.slug}`, '1')
      setUnlocked(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addToCart = (photoId: string, productId: string) => {
    const product = PRINT_PRODUCTS.find((p) => p.id === productId)
    if (!product) return
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.photoId === photoId && c.productId === productId
      )
      if (existing) {
        return prev.map((c) =>
          c.photoId === photoId && c.productId === productId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      }
      return [
        ...prev,
        {
          photoId,
          productId,
          productName: product.name,
          price: product.price,
          quantity: 1,
        },
      ]
    })
    setShowCart(true)
  }

  const canDownloadPhoto = (photoId: string) => {
    if (!allowDownloads) return false
    if (downloadedIds.has(photoId)) return true // already counted, allow re-download
    if (maxDownloads == null) return true
    return downloadedIds.size < maxDownloads
  }

  const recordDownload = (photoId: string) => {
    setDownloadedIds((prev) => {
      if (prev.has(photoId)) return prev
      const next = new Set(prev)
      next.add(photoId)
      saveDownloadedIds(gallery.slug, next)
      return next
    })
  }

  const downloadPhoto = async (photo: Photo) => {
    if (!allowDownloads) {
      setDlMessage('Downloads are not enabled for this gallery.')
      return
    }
    if (!canDownloadPhoto(photo.id)) {
      setDlMessage(
        `Download limit reached (${maxDownloads} photo${maxDownloads === 1 ? '' : 's'}). Contact Lumeriq Visuals if you need more.`
      )
      return
    }
    const filename = photo.storage_path.split('/').pop() || 'photo.jpg'
    const url = photoUrl(photo.storage_path)

    try {
      // Fetch as blob so the browser saves the file instead of opening it
      // (avoids long-press-to-save on mobile Safari / Chrome)
      const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Revoke after a short delay so the download can start
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
      recordDownload(photo.id)
      setDlMessage(null)
    } catch {
      // Fallback: open in new tab if blob download fails (e.g. CORS)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      a.rel = 'noopener'
      a.click()
      recordDownload(photo.id)
      setDlMessage(null)
    }
  }

  const downloadAll = async () => {
    if (!allowDownloads) {
      setDlMessage('Downloads are not enabled for this gallery.')
      return
    }
    const remaining =
      maxDownloads != null
        ? Math.max(0, maxDownloads - downloadedIds.size)
        : photos.length
    if (remaining <= 0) {
      setDlMessage(
        `Download limit reached (${maxDownloads} photo${maxDownloads === 1 ? '' : 's'}).`
      )
      return
    }
    let count = 0
    for (const photo of photos) {
      if (downloadedIds.has(photo.id)) continue
      if (maxDownloads != null && downloadedIds.size + count >= maxDownloads) break
      await downloadPhoto(photo)
      count++
      await new Promise((r) => setTimeout(r, 400))
    }
  }

  const downloadFavorites = async () => {
    if (!allowDownloads) return
    const favPhotos = photos.filter((p) => favorites.has(p.id))
    for (const photo of favPhotos) {
      if (!canDownloadPhoto(photo.id) && !downloadedIds.has(photo.id)) {
        setDlMessage(
          `Download limit reached. You can download ${remainingDownloads ?? 0} more.`
        )
        break
      }
      await downloadPhoto(photo)
      await new Promise((r) => setTimeout(r, 400))
    }
  }

  const checkout = async () => {
    if (!cart.length) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId: gallery.id,
          items: cart.map((c) => ({
            description: `${c.productName} (${c.photoId.slice(0, 8)})`,
            quantity: c.quantity,
            unit_price: c.price,
            photo_id: c.photoId,
            product_id: c.productId,
          })),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Checkout failed')
      }
    } catch {
      alert('Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (lightbox === null) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft')
        setLightbox((i) => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight')
        setLightbox((i) =>
          i !== null && i < photos.length - 1 ? i + 1 : i
        )
    },
    [lightbox, photos.length]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <form
          onSubmit={tryUnlock}
          className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-neutral-900 mb-1">
            {gallery.title}
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            This gallery is password protected
          </p>
          {pwError && (
            <p className="text-sm text-red-600 mb-3">Incorrect password</p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            autoFocus
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Unlock
          </button>
        </form>
      </div>
    )
  }

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0)

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <header className="sticky top-0 z-30 bg-[var(--ink)]/95 backdrop-blur border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[var(--champagne)] mb-0.5">
              Lumeriq Visuals
            </p>
            <h1 className="font-display text-lg sm:text-xl text-[var(--ivory)] truncate leading-tight">
              {gallery.title}
            </h1>
            {gallery.event_date && (
              <p className="text-[0.65rem] text-[var(--stone)] mt-0.5">
                {new Date(gallery.event_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {allowDownloads ? (
              <>
                {favorites.size > 0 && (
                  <button
                    type="button"
                    onClick={downloadFavorites}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.65rem] tracking-wide uppercase font-medium text-[var(--ivory)] hover:border-[var(--champagne)] hover:text-[var(--champagne)] transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Selected ({favorites.size})
                  </button>
                )}
                <button
                  type="button"
                  onClick={downloadAll}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.65rem] tracking-wide uppercase font-medium text-[var(--ivory)] hover:border-[var(--champagne)] hover:text-[var(--champagne)] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                  {maxDownloads != null && (
                    <span className="text-neutral-400">
                      {remainingDownloads}/{maxDownloads}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <span className="hidden sm:inline text-[0.65rem] tracking-wide uppercase text-[var(--stone)] px-2">
                Preview only · {favorites.size} selected
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="relative inline-flex items-center gap-1.5 rounded-full bg-[var(--champagne)] text-[var(--ink)] px-3 py-1.5 text-[0.65rem] tracking-wide uppercase font-semibold hover:bg-[var(--champagne-light)] transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {!allowDownloads && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 text-center text-xs sm:text-sm text-amber-900">
            Preview mode — images are watermarked. Select favourites with the
            heart. Downloads are not enabled yet.
          </div>
        </div>
      )}

      {allowDownloads && maxDownloads != null && (
        <div className="bg-neutral-100 border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 py-2 text-center text-xs text-neutral-600">
            You can download up to <strong>{maxDownloads}</strong> photos ·{' '}
            <strong>{remainingDownloads}</strong> remaining
          </div>
        </div>
      )}

      {dlMessage && (
        <div className="bg-red-50 border-b border-red-100">
          <div className="max-w-6xl mx-auto px-4 py-2 text-center text-xs text-red-700">
            {dlMessage}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {photos.length === 0 ? (
          <p className="text-center text-sm text-neutral-500 py-20">
            No photos in this gallery yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(i)}
                className="relative aspect-square overflow-hidden bg-neutral-200 group"
              >
                <WatermarkedImage
                  src={photoUrl(photo.thumbnail_path || photo.storage_path)}
                  alt=""
                  className="w-full h-full object-cover transition group-hover:scale-105"
                  watermark={showWatermark}
                />
                {favorites.has(photo.id) && (
                  <Heart className="absolute top-2 right-2 w-4 h-4 text-red-500 fill-red-500 drop-shadow" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {lightbox !== null && photos[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 h-14">
            <span className="text-white/70 text-sm">
              {lightbox + 1} / {photos.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFav(photos[lightbox].id)}
                className="p-2 text-white/80 hover:text-white"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(photos[lightbox].id)
                      ? 'fill-red-500 text-red-500'
                      : ''
                  }`}
                />
              </button>
              {allowDownloads && (
                <button
                  type="button"
                  onClick={() => downloadPhoto(photos[lightbox])}
                  className="p-2 text-white/80 hover:text-white"
                  title={
                    canDownloadPhoto(photos[lightbox].id)
                      ? 'Download original'
                      : 'Download limit reached'
                  }
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="p-2 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-2 min-h-0">
            <button
              type="button"
              onClick={() =>
                setLightbox((i) => (i !== null && i > 0 ? i - 1 : i))
              }
              className="absolute left-2 z-10 p-2 text-white/60 hover:text-white disabled:opacity-20"
              disabled={lightbox === 0}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="max-h-full max-w-full">
              <WatermarkedImage
                src={photoUrl(photos[lightbox].storage_path)}
                alt=""
                className="max-h-[75vh] max-w-full object-contain"
                watermark={showWatermark}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setLightbox((i) =>
                  i !== null && i < photos.length - 1 ? i + 1 : i
                )
              }
              className="absolute right-2 z-10 p-2 text-white/60 hover:text-white disabled:opacity-20"
              disabled={lightbox === photos.length - 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          <div className="px-4 py-3 border-t border-white/10 flex flex-wrap gap-2 justify-center">
            {PRINT_PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToCart(photos[lightbox].id, p.id)}
                className="rounded-full bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 transition"
              >
                {p.name} · {formatCurrency(p.price)}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCart(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900">Cart</h2>
              <button type="button" onClick={() => setShowCart(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-10">
                  Your cart is empty. Open a photo to add prints or downloads.
                </p>
              ) : (
                cart.map((item, i) => (
                  <div
                    key={`${item.photoId}-${item.productId}-${i}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">
                        {item.productName}
                      </p>
                      <p className="text-neutral-400 text-xs">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-neutral-700">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-neutral-100 p-5 space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={checkout}
                  disabled={checkoutLoading}
                  className="w-full rounded-lg bg-neutral-900 text-white py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60 transition"
                >
                  {checkoutLoading ? 'Redirecting…' : 'Checkout with Stripe'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
