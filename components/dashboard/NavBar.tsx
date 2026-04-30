'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Overview' },
  { href: '/store/nbof1', label: 'NBOF1 · TimauRd' },
  { href: '/store/nbof3', label: 'NBOF3 · Safari' },
  { href: '/upload', label: '↑ Upload Data' },
]

export function NavBar() {
  const path = usePathname()
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">n</div>
          <span className="font-bold text-slate-800 text-sm">nSFR Dashboard</span>
          <span className="text-slate-300 text-xs ml-1 hidden sm:block">· Darkstore Operations</span>
        </div>
        <nav className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                path === l.href
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
