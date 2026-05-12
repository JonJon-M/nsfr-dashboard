'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Props {
  defaultFrom?: string
  defaultTo?: string
}

export function DateRangePicker({ defaultFrom, defaultTo }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(defaultFrom ?? searchParams.get('from') ?? '')
  const [to, setTo] = useState(defaultTo ?? searchParams.get('to') ?? '')

  useEffect(() => {
    setFrom(searchParams.get('from') ?? '')
    setTo(searchParams.get('to') ?? '')
  }, [searchParams])

  function apply() {
    const params = new URLSearchParams(searchParams.toString())
    if (from) params.set('from', from)
    else params.delete('from')
    if (to) params.set('to', to)
    else params.delete('to')
    router.push(`${pathname}?${params.toString()}`)
  }

  function clear() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('from')
    params.delete('to')
    setFrom('')
    setTo('')
    router.push(`${pathname}?${params.toString()}`)
  }

  const isActive = !!(searchParams.get('from') || searchParams.get('to'))

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs text-slate-500 font-medium">From</span>
        <input
          type="date"
          value={from}
          min="2025-12-29"
          max="2026-12-31"
          onChange={e => setFrom(e.target.value)}
          className="text-xs text-slate-700 border-none outline-none bg-transparent cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs text-slate-500 font-medium">To</span>
        <input
          type="date"
          value={to}
          min="2025-12-29"
          max="2026-12-31"
          onChange={e => setTo(e.target.value)}
          className="text-xs text-slate-700 border-none outline-none bg-transparent cursor-pointer"
        />
      </div>

      <button
        onClick={apply}
        disabled={!from && !to}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Apply
      </button>

      {isActive && (
        <button
          onClick={clear}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
        >
          Clear filter
        </button>
      )}

      {isActive && (
        <span className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
          Filtered
        </span>
      )}
    </div>
  )
}
