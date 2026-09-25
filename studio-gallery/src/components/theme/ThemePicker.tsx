'use client'

import { THEMES, type ThemeId } from '@/lib/themes'
import { useTheme } from '@/components/theme/ThemeProvider'
import { Check } from 'lucide-react'

export function ThemePicker() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {THEMES.map((t) => {
        const active = theme === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id as ThemeId)}
            className={`text-left rounded-xl border p-4 transition relative overflow-hidden ${
              active
                ? 'border-[var(--champagne)] ring-2 ring-[var(--champagne)]/30'
                : 'border-neutral-200 hover:border-[var(--champagne)]/50'
            } bg-white`}
          >
            <div
              className="h-16 rounded-lg mb-3 flex items-end justify-end p-2"
              style={{ background: t.preview.bg }}
            >
              <span
                className="text-[0.65rem] tracking-widest uppercase font-semibold px-2 py-1 rounded-full"
                style={{
                  background: t.preview.accent,
                  color: t.preview.bg,
                }}
              >
                Aa
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-neutral-900 text-sm">{t.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              </div>
              {active && (
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--champagne)] text-[var(--ink)] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="flex gap-1.5 mt-3">
              <span
                className="w-5 h-5 rounded-full border border-black/5"
                style={{ background: t.preview.bg }}
              />
              <span
                className="w-5 h-5 rounded-full border border-black/5"
                style={{ background: t.preview.accent }}
              />
              <span
                className="w-5 h-5 rounded-full border border-black/5"
                style={{ background: t.preview.text }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
