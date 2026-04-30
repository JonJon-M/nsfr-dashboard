'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface Props {
  combinedTrend: { week: number; nbof1_r: number; nbof1_pf: number; nbof3_r: number; nbof3_pf: number }[]
}

export function OverviewCharts({ combinedTrend }: Props) {
  const data = combinedTrend.map(d => ({
    ...d,
    label: `W${d.week}`,
    'NBOF1 Refunds': d.nbof1_r,
    'NBOF1 PF': d.nbof1_pf,
    'NBOF3 Refunds': d.nbof3_r,
    'NBOF3 PF': d.nbof3_pf,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip labelFormatter={l => `${l}`} />
        <Legend iconSize={8} />
        <Bar dataKey="NBOF1 Refunds" stackId="n1" fill="#ef4444" radius={[0, 0, 0, 0]} />
        <Bar dataKey="NBOF1 PF" stackId="n1" fill="#fb923c" radius={[3, 3, 0, 0]} />
        <Bar dataKey="NBOF3 Refunds" stackId="n3" fill="#3b82f6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="NBOF3 PF" stackId="n3" fill="#60a5fa" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
