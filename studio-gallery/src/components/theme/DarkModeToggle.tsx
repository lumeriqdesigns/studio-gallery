'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme/ThemeProvider'

export function DarkModeToggle({
  className = '',
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { mode, toggleMode } = useTheme()
  const isDark = mode === 'dark'

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`inline-flex items-center gap-2 rounded-full border transition ${
        compact
          ? 'p-2 border-white/10 text-[var(--stone-light)] hover:border-[var(--champagne)] hover:text-[var(--champagne)]'
          : 'px-3 py-1.5 border-neutral-200 text-neutral-600 hover:border-[var(--champagne)] hover:text-[var(--ink)] bg-white'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      {!compact && (
        <span className="text-[0.65rem] tracking-[0.12em] uppercase font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
