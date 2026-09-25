'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'
  const authError = searchParams.get('error')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen surface-ink flex flex-col">
      <header className="flex items-center justify-between px-6 h-14 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-[var(--champagne)]/40 flex items-center justify-center">
            <span className="font-display text-[var(--champagne)] text-xs">L</span>
          </div>
          <span className="font-display text-base text-[var(--ivory)] tracking-wide">
            Lumeriq Visuals
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Studio access</p>
            <h1 className="font-display text-4xl text-[var(--ivory)] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--stone-light)] font-light">
              Sign in to manage galleries and clients
            </p>
          </div>

          <div className="card-luxe p-8 bg-[#141816] border-[var(--line)]">
            {(error || authError) && (
              <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-950/40 border border-red-900/50 p-4 text-sm text-red-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>
                  {error || 'Authentication failed. Please try again.'}
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="label-luxe text-[var(--stone-light)]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
                  placeholder="you@studio.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="label-luxe text-[var(--stone-light)]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[0.65rem] tracking-[0.12em] uppercase text-[var(--stone)] mt-8">
            Lumeriq Visuals · Admin
          </p>
        </div>
      </div>
    </div>
  )
}
