'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  DEFAULT_THEME,
  isThemeId,
  type ThemeId,
} from '@/lib/themes'

const THEME_KEY = 'lumeriq-theme'
const MODE_KEY = 'lumeriq-mode'

export type ColorMode = 'light' | 'dark'

type Ctx = {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
  mode: ColorMode
  setMode: (mode: ColorMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<Ctx>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
}

function applyMode(mode: ColorMode) {
  document.documentElement.setAttribute('data-mode', mode)
  // Also set class for any Tailwind dark: utilities if used later
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME)
  const [mode, setModeState] = useState<ColorMode>('light')

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY)
      if (savedTheme && isThemeId(savedTheme)) {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      } else {
        applyTheme(DEFAULT_THEME)
      }

      const savedMode = localStorage.getItem(MODE_KEY) as ColorMode | null
      if (savedMode === 'light' || savedMode === 'dark') {
        setModeState(savedMode)
        applyMode(savedMode)
      } else if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setModeState('dark')
        applyMode('dark')
      } else {
        applyMode('light')
      }
    } catch {
      applyTheme(DEFAULT_THEME)
      applyMode('light')
    }
  }, [])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id)
    applyTheme(id)
    try {
      localStorage.setItem(THEME_KEY, id)
      document.cookie = `lumeriq-theme=${id};path=/;max-age=31536000;samesite=lax`
    } catch {
      // ignore
    }
  }, [])

  const setMode = useCallback((m: ColorMode) => {
    setModeState(m)
    applyMode(m)
    try {
      localStorage.setItem(MODE_KEY, m)
      document.cookie = `lumeriq-mode=${m};path=/;max-age=31536000;samesite=lax`
    } catch {
      // ignore
    }
  }, [])

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }, [mode, setMode])

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, mode, setMode, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
