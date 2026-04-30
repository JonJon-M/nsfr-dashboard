'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { name: string; count: number }[]
  color?: string
  height?: number
}

export function HorizontalBarChart({ data, color = '#3b82f6', height = 240 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
        <Tooltip />
        <Bar dataKey="count" name="Incidents" fill={color} radius={[0, 3, 3, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={color} opacity={1 - i * 0.07} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
