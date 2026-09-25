export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function publicPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base || !path) return ''
  return `${base}/storage/v1/object/public/gallery-photos/${path}`
}

/** Signed URL helper is done server-side; this builds the public path when bucket is public-read for published. */
export function storagePath(galleryId: string, filename: string): string {
  return `${galleryId}/${filename}`
}

export async function hashPassword(password: string): Promise<string> {
  // Simple client-compatible hash for gallery passwords (not crypto-grade auth)
  // Uses Web Crypto when available
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const enc = new TextEncoder()
    const data = enc.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Server fallback via dynamic import avoided; use same approach with node crypto if needed
  const { createHash } = await import('crypto')
  return createHash('sha256').update(password).digest('hex')
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const h = await hashPassword(password)
  return h === hash
}
