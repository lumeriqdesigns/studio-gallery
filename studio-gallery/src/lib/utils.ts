export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Format amount in Nigerian Naira (default). */
export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('en-NG', {
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

/** Object path convention: {gallery_id}/{filename} */
export function storagePath(galleryId: string, filename: string): string {
  return `${galleryId}/${filename}`
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const enc = new TextEncoder()
    const data = enc.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
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

export const BRAND = {
  name: 'Lumeriq Visuals',
  tagline: 'Photography & visual storytelling',
  shortName: 'Lumeriq',
} as const
