const styles: Record<string, string> = {
  // booking
  inquiry: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-neutral-100 text-neutral-500 border-neutral-200',
  // invoice
  draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  void: 'bg-neutral-100 text-neutral-400 border-neutral-200',
  // order
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  fulfilled: 'bg-violet-50 text-violet-700 border-violet-200',
  // publish
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft_gallery: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${cls}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
