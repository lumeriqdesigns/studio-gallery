'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SESSION_TYPES = [
  'Portrait session',
  'Wedding / engagement',
  'Event coverage',
  'Commercial / brand',
  'Family session',
  'Other',
]

export default function BookSessionPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0])
  const [preferredDate, setPreferredDate] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let clientId: string | null = null

      if (email.trim()) {
        const { data: existing } = await supabase
          .from('clients')
          .select('id')
          .eq('email', email.trim())
          .maybeSingle()

        if (existing) {
          clientId = existing.id
          await supabase
            .from('clients')
            .update({
              name: name.trim(),
              phone: phone.trim() || null,
            })
            .eq('id', clientId)
        } else {
          const { data: created, error: cErr } = await supabase
            .from('clients')
            .insert({
              name: name.trim(),
              email: email.trim() || null,
              phone: phone.trim() || null,
              notes: message.trim() || null,
            })
            .select('id')
            .single()
          if (cErr) throw cErr
          clientId = created.id
        }
      } else {
        const { data: created, error: cErr } = await supabase
          .from('clients')
          .insert({
            name: name.trim(),
            phone: phone.trim() || null,
            notes: message.trim() || null,
          })
          .select('id')
          .single()
        if (cErr) throw cErr
        clientId = created.id
      }

      const title = `${sessionType} — ${name.trim()}`
      const notes = [
        message.trim(),
        phone.trim() ? `Phone: ${phone.trim()}` : '',
        email.trim() ? `Email: ${email.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const { error: bErr } = await supabase.from('bookings').insert({
        client_id: clientId,
        title,
        event_date: preferredDate || null,
        location: location.trim() || null,
        status: 'inquiry',
        notes: notes || null,
      })
      if (bErr) throw bErr
      setDone(true)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not submit booking request'
      if (
        msg.toLowerCase().includes('row-level security') ||
        msg.toLowerCase().includes('policy')
      ) {
        setError(
          'Booking form is not yet open for public submissions. Please try again later.'
        )
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen surface-ink flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md card-luxe bg-[#141816] border-[var(--line)] p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-[var(--champagne)] mx-auto mb-5" />
          <p className="eyebrow mb-3">Request received</p>
          <h1 className="font-display text-3xl text-[var(--ivory)] mb-3">
            Thank you
          </h1>
          <p className="text-sm text-[var(--stone-light)] font-light leading-relaxed mb-8">
            We&apos;ll review your session request and get back to you shortly
            from <span className="text-[var(--champagne-light)]">Lumeriq Visuals</span>.
          </p>
          <Link href="/" className="btn-primary">
            Back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen surface-ink">
      <header className="border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-[var(--champagne)]/40 flex items-center justify-center">
              <span className="font-display text-[var(--champagne)] text-xs">L</span>
            </div>
            <span className="font-display text-base text-[var(--ivory)] tracking-wide">
              Lumeriq Visuals
            </span>
          </Link>
          <Link
            href="/login"
            className="text-[0.65rem] tracking-[0.14em] uppercase text-[var(--stone)] hover:text-[var(--champagne)]"
          >
            Studio login
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <p className="eyebrow mb-3">Reservations</p>
        <h1 className="font-display text-4xl text-[var(--ivory)] mb-2">
          Book a session
        </h1>
        <p className="text-sm text-[var(--stone-light)] font-light mb-10 leading-relaxed">
          Tell us about your shoot. We&apos;ll confirm availability and next
          steps.
        </p>

        <form
          onSubmit={submit}
          className="card-luxe bg-[#141816] border-[var(--line)] p-6 sm:p-8 space-y-5"
        >
          {error && (
            <div className="rounded-lg bg-red-950/40 border border-red-900/50 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="label-luxe text-[var(--stone-light)]">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-luxe text-[var(--stone-light)]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="label-luxe text-[var(--stone-light)]">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
                placeholder="+234 …"
              />
            </div>
          </div>

          <div>
            <label className="label-luxe text-[var(--stone-light)]">Session type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
            >
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-luxe text-[var(--stone-light)]">Preferred date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
              />
            </div>
            <div>
              <label className="label-luxe text-[var(--stone-light)]">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)]"
                placeholder="City or venue"
              />
            </div>
          </div>

          <div>
            <label className="label-luxe text-[var(--stone-light)]">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="input-luxe bg-[#0c0f0e] border-white/10 text-[var(--ivory)] resize-none"
              placeholder="Tell us about the shoot, number of people, style…"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit request
          </button>
        </form>
      </main>
    </div>
  )
}
