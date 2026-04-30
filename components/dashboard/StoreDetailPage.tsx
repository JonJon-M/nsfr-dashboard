import { supabase } from '@/lib/supabase'
import { fmtKES, fmt, CCR3_COLORS, PF_COLORS } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PickerTable } from '@/components/dashboard/PickerTable'
import { ActionPlanPanel } from '@/components/dashboard/ActionPlanPanel'
import { StoreCharts } from '@/components/dashboard/StoreCharts'
import type { ActionPlan } from '@/lib/types'

interface Props {
  store: string
  slug: 'nbof1' | 'nbof3'
}

async function getStoreData(store: string) {
  const [refundsRes, pfRes, plansRes] = await Promise.all([
    supabase.from('refunds').select('*').eq('store', store).range(0, 9999),
    supabase.from('product_failures').select('*').eq('store', store).range(0, 9999),
    supabase.from('action_plans').select('*').eq('store', store).order('priority').order('id'),
  ])

  const refunds = refundsRes.data ?? []
  const pfs = pfRes.data ?? []
  const plans = (plansRes.data ?? []) as ActionPlan[]

  const totalRefunds = refunds.length
  const totalPF = pfs.length
  const refundAmount = refunds.reduce((s: number, r: { refund_and_comp?: number }) => s + (r.refund_and_comp ?? 0), 0)

  // Weekly
  const byWeek: Record<number, { refunds: number; pf: number; amount: number }> = {}
  refunds.forEach((r: { week?: number; refund_and_comp?: number }) => {
    if (!r.week) return
    if (!byWeek[r.week]) byWeek[r.week] = { refunds: 0, pf: 0, amount: 0 }
    byWeek[r.week].refunds++
    byWeek[r.week].amount += r.refund_and_comp ?? 0
  })
  pfs.forEach((p: { week?: number }) => {
    if (!p.week) return
    if (!byWeek[p.week]) byWeek[p.week] = { refunds: 0, pf: 0, amount: 0 }
    byWeek[p.week].pf++
  })
  const weeklyTrend = Object.entries(byWeek)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([week, v]) => ({ week: Number(week), ...v }))

  // CCR3
  const ccr3Map: Record<string, number> = {}
  refunds.forEach((r: { ccr3?: string }) => {
    if (r.ccr3) ccr3Map[r.ccr3] = (ccr3Map[r.ccr3] ?? 0) + 1
  })
  const ccr3Data = Object.entries(ccr3Map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  // PF causes
  const pfMap: Record<string, number> = {}
  pfs.forEach((p: { pf_root_cause?: string }) => {
    if (p.pf_root_cause) pfMap[p.pf_root_cause] = (pfMap[p.pf_root_cause] ?? 0) + 1
  })
  const pfData = Object.entries(pfMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  // Top suppliers
  const supMap: Record<string, number> = {}
  refunds.forEach((r: { supplier_name?: string }) => {
    if (r.supplier_name && r.supplier_name !== 'null') supMap[r.supplier_name] = (supMap[r.supplier_name] ?? 0) + 1
  })
  const topSuppliers = Object.entries(supMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }))

  // Top categories
  const catMap: Record<string, number> = {}
  refunds.forEach((r: { category_l1?: string }) => {
    if (r.category_l1 && r.category_l1 !== 'null') catMap[r.category_l1] = (catMap[r.category_l1] ?? 0) + 1
  })
  const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }))

  // Pickers
  const pickerR: Record<string, number> = {}
  const pickerPF: Record<string, number> = {}
  refunds.forEach((r: { picker_name?: string }) => { if (r.picker_name) pickerR[r.picker_name] = (pickerR[r.picker_name] ?? 0) + 1 })
  pfs.forEach((p: { picker_name?: string }) => { if (p.picker_name) pickerPF[p.picker_name] = (pickerPF[p.picker_name] ?? 0) + 1 })
  const topPickers = Array.from(new Set([...Object.keys(pickerR), ...Object.keys(pickerPF)]))
    .map(name => ({ name, refunds: pickerR[name] ?? 0, pf: pickerPF[name] ?? 0, total: (pickerR[name] ?? 0) + (pickerPF[name] ?? 0) }))
    .sort((a, b) => b.total - a.total).slice(0, 10)

  // Top PF SKUs
  const skuMap: Record<string, { name: string; count: number; cause: string }> = {}
  pfs.forEach((p: { sku?: string; sku_name?: string; pf_root_cause?: string }) => {
    const key = String(p.sku ?? '')
    if (!skuMap[key]) skuMap[key] = { name: p.sku_name ?? key, count: 0, cause: p.pf_root_cause ?? '' }
    skuMap[key].count++
  })
  const topPFSkus = Object.entries(skuMap).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([sku, v]) => ({ sku, ...v }))

  // Top refund SKUs
  const rSkuMap: Record<string, { name: string; count: number; amount: number }> = {}
  refunds.forEach((r: { sku?: string; product_name?: string; refund_and_comp?: number }) => {
    const key = String(r.sku ?? '')
    if (!key || key === 'null') return
    if (!rSkuMap[key]) rSkuMap[key] = { name: r.product_name ?? key, count: 0, amount: 0 }
    rSkuMap[key].count++
    rSkuMap[key].amount += r.refund_and_comp ?? 0
  })
  const topRefundSkus = Object.entries(rSkuMap).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([sku, v]) => ({ sku, ...v }))

  return { totalRefunds, totalPF, refundAmount, weeklyTrend, ccr3Data, pfData, topSuppliers, topCategories, topPickers, topPFSkus, topRefundSkus, plans }
}

export async function StoreDetailPage({ store, slug }: Props) {
  const {
    totalRefunds, totalPF, refundAmount, weeklyTrend, ccr3Data, pfData,
    topSuppliers, topCategories, topPickers, topPFSkus, topRefundSkus, plans
  } = await getStoreData(store)

  const avgWeeklyRefunds = totalRefunds > 0 ? (totalRefunds / Math.max(weeklyTrend.length, 1)) : 0
  const avgWeeklyAmount = refundAmount > 0 ? (refundAmount / Math.max(weeklyTrend.length, 1)) : 0
  const iiPct = pfData.find(p => p.name === 'Inventory Inaccuracy') ? Math.round((pfData.find(p => p.name === 'Inventory Inaccuracy')!.value / totalPF) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{store}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Full nSFR Analysis & Action Plans</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Refund Incidents" value={fmt(totalRefunds)} sub={`~${fmt(avgWeeklyRefunds, 0)}/week avg`} color="red" />
        <StatCard label="Product Failures" value={fmt(totalPF)} sub={`${iiPct}% Inventory Inaccuracy`} color="orange" />
        <StatCard label="Financial Loss (EUR)" value={fmtKES(refundAmount)} sub={`~${fmtKES(avgWeeklyAmount)}/week avg`} color="blue" />
        <StatCard label="Total nSFR" value={fmt(totalRefunds + totalPF)} sub="Combined incidents" color="purple" />
      </div>

      {/* Charts */}
      <StoreCharts
        weeklyTrend={weeklyTrend}
        ccr3Data={ccr3Data}
        pfData={pfData}
        ccr3Colors={CCR3_COLORS}
        pfColors={PF_COLORS}
        topSuppliers={topSuppliers}
        topCategories={topCategories}
      />

      {/* Tables row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pickers */}
        <Card>
          <CardHeader>
            <CardTitle>Picker nSFR Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PickerTable pickers={topPickers} store={store} />
          </CardContent>
        </Card>

        {/* Top PF SKUs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Product Failure SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">SKU / Name</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Count</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Cause</th>
                  </tr>
                </thead>
                <tbody>
                  {topPFSkus.map((s, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-700 text-xs truncate max-w-[160px]">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.sku}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-orange-600">{s.count}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">{s.cause}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top refund SKUs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Refund SKUs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Incidents</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Total Loss</th>
                </tr>
              </thead>
              <tbody>
                {topRefundSkus.map((s, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-700">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.sku}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-red-600">{s.count}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{fmtKES(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Action Plans — {store}</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionPlanPanel plans={plans} />
        </CardContent>
      </Card>
    </div>
  )
}
