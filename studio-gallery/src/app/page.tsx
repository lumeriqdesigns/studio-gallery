import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen surface-ink relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(196,165,116,0.25), transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-1/2 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(196,165,116,0.12), transparent 70%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 sm:px-10 h-16 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[var(--champagne)]/40 flex items-center justify-center">
              <span className="font-display text-[var(--champagne)] text-sm">L</span>
            </div>
            <span className="font-display text-lg tracking-wide text-[var(--ivory)]">
              Lumeriq Visuals
            </span>
          </div>
          <Link
            href="/login"
            className="text-[0.65rem] tracking-[0.16em] uppercase text-[var(--stone-light)] hover:text-[var(--champagne)] transition"
          >
            Studio login
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="eyebrow mb-6">Ilorin · Kwara State</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-[var(--ivory)] leading-[1.05] max-w-3xl mb-6">
            Visuals that
            <br />
            <span className="italic text-[var(--champagne-light)]">stand out</span>
          </h1>
          <div className="hairline w-24 mx-auto mb-8" />
          <p className="text-[var(--stone-light)] text-base sm:text-lg max-w-md leading-relaxed mb-10 font-light">
            Client galleries, private proofing, and photography services —
            delivered with care.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/book" className="btn-primary">
              Book a session
            </Link>
            <Link href="/login" className="btn-ghost text-[var(--ivory)]">
              Photographer login
            </Link>
          </div>
        </main>

        <footer className="px-6 py-6 text-center text-[0.65rem] tracking-[0.14em] uppercase text-[var(--stone)] border-t border-white/5">
          © {new Date().getFullYear()} Lumeriq Visuals
        </footer>
      </div>
    </div>
  )
}
