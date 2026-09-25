'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (compact) {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition disabled:opacity-50"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      Sign out
    </button>
  )
}
