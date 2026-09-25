'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Camera, Loader2, CheckCircle2 } from 'lucide-react'
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

      // Create or find client by email
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
      // If RLS blocks anon insert, show a friendly message
      const msg =
        err instanceof Error ? err.message : 'Could not submit booking request'
      if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('policy')) {
        setError(
          'Booking form is not yet open for public submissions. Please email us or try again later.'
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
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Request received
          </h1>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Thank you for choosing <strong>Lumeriq Visuals</strong>. We&apos;ll
            review your session request and get back to you shortly.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-900">
            <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Lumeriq Visuals
            </span>
          </Link>
          <Link
            href="/login"
            className="text-xs text-neutral-500 hover:text-neutral-800"
          >
            Photographer login
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-1">
          Book a session
        </h1>
        <p className="text-sm text-neutral-500 mb-8">
          Tell us about your shoot. Lumeriq Visuals will confirm availability
          and next steps.
        </p>

        <form onSubmit={submit} className="space-y-5 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Full name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="+234 …"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Session type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
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
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Preferred date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="City or venue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Tell us about the shoot, number of people, style preferences…"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 text-white py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60 transition"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit request
          </button>
        </form>
      </main>
    </div>
  )
}
