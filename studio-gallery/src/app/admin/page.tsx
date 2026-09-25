import { createClient } from '@/lib/supabase/server'
import { Images, Calendar, FileText, Users, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Placeholder stats — will be wired to real data in later features
  const stats = [
    {
      label: 'Galleries',
      value: '—',
      href: '/admin/galleries',
      icon: Images,
      description: 'Client photo galleries',
    },
    {
      label: 'Bookings',
      value: '—',
      href: '/admin/bookings',
      icon: Calendar,
      description: 'Upcoming sessions',
    },
    {
      label: 'Invoices',
      value: '—',
      href: '/admin/invoices',
      icon: FileText,
      description: 'Open & paid invoices',
    },
    {
      label: 'Orders',
      value: '—',
      href: '/admin/orders',
      icon: ShoppingBag,
      description: 'Print & digital sales',
    },
    {
      label: 'Clients',
      value: '—',
      href: '/admin/clients',
      icon: Users,
      description: 'CRM & notes',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-neutral-500 mt-1 text-sm">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.
          Manage your photography business.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="group bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="text-3xl font-semibold text-neutral-900 mt-1 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  {stat.description}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm font-medium text-neutral-900 mb-2">
          Getting started
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Feature 1 (authentication) is complete. Next up: create client
          galleries, upload photos, and generate private shareable links.
          Configure your Supabase project and create your admin user to get
          started.
        </p>
      </div>
    </div>
  )
}
