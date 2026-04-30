'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { WeeklyTrendChart } from '@/components/charts/WeeklyTrendChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart'

interface Props {
  weeklyTrend: { week: number; refunds: number; pf: number; amount: number }[]
  ccr3Data: { name: string; value: number }[]
  pfData: { name: string; value: number }[]
  ccr3Colors: Record<string, string>
  pfColors: Record<string, string>
  topSuppliers: { name: string; count: number }[]
  topCategories: { name: string; count: number }[]
}

export function StoreCharts({ weeklyTrend, ccr3Data, pfData, ccr3Colors, pfColors, topSuppliers, topCategories }: Props) {
  return (
    <div className="space-y-6">
      {/* Weekly trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly nSFR Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyTrendChart data={weeklyTrend} />
        </CardContent>
      </Card>

      {/* Donut charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Refund Root Causes (CCR3)</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={ccr3Data} colors={ccr3Colors} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product Failure Root Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={pfData} colors={pfColors} />
          </CardContent>
        </Card>
      </div>

      {/* Bar charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers by Refund Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={topSuppliers} color="#ef4444" height={220} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Refund Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={topCategories} color="#3b82f6" height={220} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
