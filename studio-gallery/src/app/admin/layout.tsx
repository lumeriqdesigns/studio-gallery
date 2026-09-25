import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Camera, LayoutDashboard, Images, Calendar, FileText, Users, ShoppingBag } from 'lucide-react'
import { SignOutButton } from '@/components/SignOutButton'

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
  ]

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-neutral-200 fixed inset-y-0">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <span className="font-semibold text-neutral-900 tracking-tight">
            Lumeriq Visuals
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-neutral-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm">Lumeriq Visuals</span>
        </div>
        <SignOutButton compact />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
