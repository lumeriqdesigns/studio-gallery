import { ThemePicker } from '@/components/theme/ThemePicker'
import { DarkModeToggle } from '@/components/theme/DarkModeToggle'

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Studio</p>
          <h1 className="font-display text-3xl text-neutral-900 tracking-tight">
            Appearance
          </h1>
          <p className="text-neutral-500 mt-1 text-sm font-light max-w-xl">
            Choose a luxury colour theme and switch between light and dark mode.
          </p>
        </div>
        <DarkModeToggle />
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-medium text-neutral-900 mb-1">Light / Dark</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Dark mode uses deep ink surfaces; light mode uses ivory content areas.
          Works with every luxury theme below.
        </p>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <span className="text-xs text-neutral-400">
            Also respects your system preference on first visit
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-neutral-900 mb-1">Colour theme</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Accent palette for brand gold, rose, emerald, and more.
        </p>
        <ThemePicker />
      </section>
    </div>
  )
}
