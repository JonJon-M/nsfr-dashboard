'use client'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

interface Props {
  data: { week: number; refunds: number; pf: number; amount: number }[]
}

export function WeeklyTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="week" tickFormatter={v => `W${v}`} tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} />
        <Tooltip
          formatter={(value, name) => {
            const v = Number(value)
            if (name === 'amount') return [`KES ${v.toFixed(2)}`, 'Refund Cost']
            return [v, name === 'refunds' ? 'Refund Incidents' : 'PF Incidents']
          }}
          labelFormatter={l => `Week ${l}`}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="refunds" name="Refunds" fill="#ef4444" opacity={0.85} radius={[3, 3, 0, 0]} />
        <Bar yAxisId="left" dataKey="pf" name="Product Failures" fill="#f97316" opacity={0.85} radius={[3, 3, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="amount" name="Refund Cost (KES)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
