'use client'

import { useEffect, useState } from 'react'

const WATERMARK_TEXT = 'Lumeriq Visuals'

/**
 * Displays an image with a diagonal "Lumeriq Visuals" watermark overlay (canvas).
 * Used for on-screen previews; authorized downloads use the original URL separately.
 */
export function WatermarkedImage({
  src,
  alt = '',
  className = '',
  watermark = true,
}: {
  src: string
  alt?: string
  className?: string
  watermark?: boolean
}) {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) return
    if (!watermark) {
      setDisplaySrc(src)
      return
    }

    let revoked: string | null = null
    let cancelled = false

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setDisplaySrc(src)
          return
        }
        ctx.drawImage(img, 0, 0)

        // Semi-transparent repeating diagonal watermark
        const size = Math.max(14, Math.round(Math.min(canvas.width, canvas.height) / 28))
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(-Math.PI / 6)
        ctx.font = `600 ${size}px system-ui, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.lineWidth = 2
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const stepX = size * 10
        const stepY = size * 5
        for (let y = -canvas.height; y < canvas.height; y += stepY) {
          for (let x = -canvas.width; x < canvas.width; x += stepX) {
            ctx.strokeText(WATERMARK_TEXT, x, y)
            ctx.fillText(WATERMARK_TEXT, x, y)
          }
        }
        ctx.restore()

        // Corner brand mark
        const pad = size
        ctx.font = `600 ${Math.round(size * 0.9)}px system-ui, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
        ctx.lineWidth = 3
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.strokeText(WATERMARK_TEXT, canvas.width - pad, canvas.height - pad)
        ctx.fillText(WATERMARK_TEXT, canvas.width - pad, canvas.height - pad)

        canvas.toBlob(
          (blob) => {
            if (cancelled || !blob) {
              setDisplaySrc(src)
              return
            }
            const url = URL.createObjectURL(blob)
            revoked = url
            setDisplaySrc(url)
          },
          'image/jpeg',
          0.88
        )
      } catch {
        setDisplaySrc(src)
      }
    }
    img.onerror = () => {
      if (!cancelled) {
        setFailed(true)
        setDisplaySrc(src)
      }
    }
    img.src = src

    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [src, watermark])

  if (!displaySrc) {
    return (
      <div
        className={`bg-neutral-200 animate-pulse ${className}`}
        aria-hidden
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      draggable={false}
      onContextMenu={watermark ? (e) => e.preventDefault() : undefined}
    />
  )
}
