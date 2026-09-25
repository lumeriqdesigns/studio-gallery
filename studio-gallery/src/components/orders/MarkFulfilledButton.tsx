'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function MarkFulfilledButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const mark = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', orderId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={mark}
      disabled={loading}
      className="text-xs font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Mark fulfilled'}
    </button>
  )
}
