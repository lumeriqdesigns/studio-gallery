import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard,
  Images,
  Calendar,
  FileText,
  Users,
  ShoppingBag,
  Palette,
} from 'lucide-react'
import { SignOutButton } from '@/components/SignOutButton'
import { DarkModeToggle } from '@/components/theme/DarkModeToggle'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/galleries', label: 'Galleries', icon: Images },
    { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { href: '/admin/invoices', label: 'Invoices', icon: FileText },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/clients', label: 'Clients', icon: Users },
    { href: '/admin/settings', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="min-h-screen bg-[var(--ivory)] admin-shell flex">
      <aside className="hidden md:flex w-60 flex-col surface-ink fixed inset-y-0 border-r border-white/5">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
          <div className="w-8 h-8 rounded-full border border-[var(--champagne)]/40 flex items-center justify-center">
            <span className="font-display text-[var(--champagne)] text-sm">L</span>
          </div>
          <span className="font-display text-lg tracking-wide text-[var(--ivory)]">
            Lumeriq
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--stone-light)] hover:bg-white/5 hover:text-[var(--champagne-light)] transition"
            >
              <item.icon className="w-4 h-4 shrink-0 opacity-70" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <div className="px-3 py-2 mb-2 flex items-center justify-between gap-2">
            <p className="text-[0.65rem] tracking-wide text-[var(--stone)] truncate min-w-0">
              {user.email}
            </p>
            <DarkModeToggle compact className="shrink-0" />
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 h-14 surface-ink border-b border-white/5 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border border-[var(--champagne)]/40 flex items-center justify-center">
            <span className="font-display text-[var(--champagne)] text-xs">L</span>
          </div>
          <span className="font-display text-base text-[var(--ivory)]">Lumeriq</span>
        </div>
        <div className="flex items-center gap-1">
          <DarkModeToggle compact />
          <SignOutButton compact />
        </div>
      </div>

      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
