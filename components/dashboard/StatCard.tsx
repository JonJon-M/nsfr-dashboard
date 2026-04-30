import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  sub?: string
  color?: 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'slate'
  icon?: React.ReactNode
}

const colorMap = {
  red: 'border-l-red-500 bg-red-50',
  orange: 'border-l-orange-500 bg-orange-50',
  blue: 'border-l-blue-500 bg-blue-50',
  green: 'border-l-green-500 bg-green-50',
  purple: 'border-l-purple-500 bg-purple-50',
  slate: 'border-l-slate-500 bg-slate-50',
}

const textMap = {
  red: 'text-red-700',
  orange: 'text-orange-700',
  blue: 'text-blue-700',
  green: 'text-green-700',
  purple: 'text-purple-700',
  slate: 'text-slate-700',
}

export function StatCard({ label, value, sub, color = 'slate', icon }: Props) {
  return (
    <div className={cn('rounded-xl border-l-4 p-4 shadow-sm', colorMap[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', textMap[color])}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        {icon && <div className={cn('text-xl', textMap[color])}>{icon}</div>}
      </div>
    </div>
  )
}
