'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

interface CombinedPoint {
  week: number
  nbof1_r: number
  nbof1_pf: number
  nbof3_r: number
  nbof3_pf: number
  nbof1_orders: number
  nbof3_orders: number
}

interface Props {
  combinedTrend: CombinedPoint[]
}

function pct(n: number, total: number) {
  if (!total) return 0
  return parseFloat(((n / total) * 100).toFixed(2))
}

export function OverviewCharts({ combinedTrend }: Props) {
  const hasOrders = combinedTrend.some(d => (d.nbof1_orders + d.nbof3_orders) > 0)

  const data = combinedTrend.map(d => ({
    label: `W${d.week}`,
    week: d.week,
    nbof1_orders: d.nbof1_orders,
    nbof3_orders: d.nbof3_orders,
    nbof1_r_raw: d.nbof1_r,
    nbof1_pf_raw: d.nbof1_pf,
    nbof3_r_raw: d.nbof3_r,
    nbof3_pf_raw: d.nbof3_pf,
    'NBOF1 Refund %': pct(d.nbof1_r, d.nbof1_orders),
    'NBOF1 PF %':     pct(d.nbof1_pf, d.nbof1_orders),
    'NBOF3 Refund %': pct(d.nbof3_r, d.nbof3_orders),
    'NBOF3 PF %':     pct(d.nbof3_pf, d.nbof3_orders),
    // raw fallback
    'NBOF1 Refunds': d.nbof1_r,
    'NBOF1 PF':      d.nbof1_pf,
    'NBOF3 Refunds': d.nbof3_r,
    'NBOF3 PF':      d.nbof3_pf,
  }))

  if (hasOrders) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 'auto']} />
          <Tooltip
            formatter={(value, name) => [`${Number(value).toFixed(2)}%`, String(name)]}
            labelFormatter={(label, payload) => {
              const d = payload?.[0]?.payload
              const n1 = ((d?.['NBOF1 Refund %'] ?? 0) + (d?.['NBOF1 PF %'] ?? 0)).toFixed(2)
              const n3 = ((d?.['NBOF3 Refund %'] ?? 0) + (d?.['NBOF3 PF %'] ?? 0)).toFixed(2)
              return `${label}  |  NBOF1 nSFR ${n1}%  ·  NBOF3 nSFR ${n3}%`
            }}
            contentStyle={{ fontSize: 11 }}
          />
          <Legend iconSize={8} />
          <ReferenceLine y={0.75} stroke="#f97316" strokeDasharray="4 3" label={{ value: 'PF 0.75%',   position: 'insideTopRight', fontSize: 9, fill: '#f97316' }} />
          <ReferenceLine y={1.00} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'Ref 1.00%',  position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
          <ReferenceLine y={1.75} stroke="#7c3aed" strokeDasharray="4 3" label={{ value: 'nSFR 1.75%', position: 'insideTopRight', fontSize: 9, fill: '#7c3aed' }} />
          <Bar dataKey="NBOF1 Refund %" stackId="n1" fill="#ef4444" opacity={0.85} radius={[0, 0, 0, 0]} />
          <Bar dataKey="NBOF1 PF %"     stackId="n1" fill="#fb923c" opacity={0.85} radius={[3, 3, 0, 0]} />
          <Bar dataKey="NBOF3 Refund %" stackId="n3" fill="#3b82f6" opacity={0.85} radius={[0, 0, 0, 0]} />
          <Bar dataKey="NBOF3 PF %"     stackId="n3" fill="#60a5fa" opacity={0.85} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Fallback: raw counts
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip
          formatter={(value, name) => [Number(value), String(name)]}
          contentStyle={{ fontSize: 11 }}
        />
        <Legend iconSize={8} />
        <Bar dataKey="NBOF1 Refunds" stackId="n1" fill="#ef4444" radius={[0, 0, 0, 0]} />
        <Bar dataKey="NBOF1 PF"      stackId="n1" fill="#fb923c" radius={[3, 3, 0, 0]} />
        <Bar dataKey="NBOF3 Refunds" stackId="n3" fill="#3b82f6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="NBOF3 PF"      stackId="n3" fill="#60a5fa" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
