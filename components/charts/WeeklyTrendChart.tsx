'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

interface WeekPoint {
  week: number
  refunds: number
  pf: number
  amount: number
  totalOrders?: number
}

interface Props {
  data: WeekPoint[]
}

function pct(n: number, total: number) {
  if (!total) return 0
  return parseFloat(((n / total) * 100).toFixed(2))
}

export function WeeklyTrendChart({ data }: Props) {
  const hasOrders = data.some(d => (d.totalOrders ?? 0) > 0)

  const chartData = data.map(d => {
    const orders = d.totalOrders ?? 0
    return {
      label: `W${d.week}`,
      week: d.week,
      refunds: d.refunds,
      pf: d.pf,
      amount: d.amount,
      totalOrders: orders,
      'Refund %': pct(d.refunds, orders),
      'PF %': pct(d.pf, orders),
    }
  })

  if (hasOrders) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 'auto']} />
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value)
              return [`${v.toFixed(2)}%`, String(name)]
            }}
            labelFormatter={(label, payload) => {
              const d = payload?.[0]?.payload
              const nsfr = ((d?.['Refund %'] ?? 0) + (d?.['PF %'] ?? 0)).toFixed(2)
              return `${label}  |  ${d?.totalOrders?.toLocaleString() ?? '–'} orders  |  nSFR ${nsfr}%`
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend iconSize={10} />
          <ReferenceLine y={5} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: '5%', fontSize: 9, fill: '#94a3b8' }} />
          <Bar dataKey="Refund %" stackId="a" fill="#ef4444" opacity={0.85} radius={[0, 0, 0, 0]} />
          <Bar dataKey="PF %"     stackId="a" fill="#f97316" opacity={0.85} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Fallback: raw counts (no orders data in scope)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value, name) => [Number(value), String(name)]}
          labelFormatter={l => `Week ${String(l).replace('W', '')}`}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend iconSize={10} />
        <Bar dataKey="refunds" name="Refunds"          stackId="a" fill="#ef4444" opacity={0.85} radius={[0, 0, 0, 0]} />
        <Bar dataKey="pf"      name="Product Failures" stackId="a" fill="#f97316" opacity={0.85} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
