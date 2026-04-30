import { supabase } from '@/lib/supabase'
import { fmtKES, fmt } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { OverviewCharts } from '@/components/dashboard/OverviewCharts'
import Link from 'next/link'

export const revalidate = 60

async function getOverviewData() {
  const [refundsRes, pfRes, batchesRes] = await Promise.all([
    supabase.from('refunds').select('store, ccr3, refund_and_comp, week').range(0, 9999),
    supabase.from('product_failures').select('store, pf_root_cause, week').range(0, 9999),
    supabase.from('upload_batches').select('*').order('uploaded_at', { ascending: false }).limit(1),
  ])

  const refunds = refundsRes.data ?? []
  const pfs = pfRes.data ?? []

  const stores = ['NBOF1 - TimauRd', 'NBOF3 - Safari'] as const

  const storeStats = stores.map(store => {
    const sr = refunds.filter(r => r.store === store)
    const sp = pfs.filter(p => p.store === store)
    const amount = sr.reduce((s: number, r: { refund_and_comp?: number }) => s + (r.refund_and_comp ?? 0), 0)

    const byWeek: Record<number, { refunds: number; pf: number; amount: number }> = {}
    sr.forEach((r: { week?: number; refund_and_comp?: number }) => {
      if (!r.week) return
      if (!byWeek[r.week]) byWeek[r.week] = { refunds: 0, pf: 0, amount: 0 }
      byWeek[r.week].refunds++
      byWeek[r.week].amount += r.refund_and_comp ?? 0
    })
    sp.forEach((p: { week?: number }) => {
      if (!p.week) return
      if (!byWeek[p.week]) byWeek[p.week] = { refunds: 0, pf: 0, amount: 0 }
      byWeek[p.week].pf++
    })
    const trend = Object.entries(byWeek)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([week, v]) => ({ week: Number(week), ...v }))

    return { store, refunds: sr.length, pf: sp.length, amount, trend }
  })

  const combinedByWeek: Record<number, { week: number; nbof1_r: number; nbof1_pf: number; nbof3_r: number; nbof3_pf: number }> = {}
  refunds.forEach((r: { week?: number; store?: string }) => {
    if (!r.week) return
    if (!combinedByWeek[r.week]) combinedByWeek[r.week] = { week: r.week, nbof1_r: 0, nbof1_pf: 0, nbof3_r: 0, nbof3_pf: 0 }
    if (r.store === 'NBOF1 - TimauRd') combinedByWeek[r.week].nbof1_r++
    else combinedByWeek[r.week].nbof3_r++
  })
  pfs.forEach((p: { week?: number; store?: string }) => {
    if (!p.week) return
    if (!combinedByWeek[p.week]) combinedByWeek[p.week] = { week: p.week, nbof1_r: 0, nbof1_pf: 0, nbof3_r: 0, nbof3_pf: 0 }
    if (p.store === 'NBOF1 - TimauRd') combinedByWeek[p.week].nbof1_pf++
    else combinedByWeek[p.week].nbof3_pf++
  })
  const combinedTrend = Object.values(combinedByWeek).sort((a, b) => a.week - b.week)

  const lastUpload = batchesRes.data?.[0] ?? null
  const totalAmount = refunds.reduce((s: number, r: { refund_and_comp?: number }) => s + (r.refund_and_comp ?? 0), 0)
  return { storeStats, combinedTrend, lastUpload, totalRefunds: refunds.length, totalPF: pfs.length, totalAmount }
}

export default async function OverviewPage() {
  const { storeStats, combinedTrend, lastUpload, totalRefunds, totalPF, totalAmount } = await getOverviewData()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">nSFR Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Non-Seamless Fulfilment Rate · NBOF1 TimauRd & NBOF3 Safari · All Weeks
          </p>
        </div>
        {lastUpload && (
          <div className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2">
            Last upload: <span className="font-medium text-slate-600">{lastUpload.filename}</span><br />
            {new Date(lastUpload.uploaded_at).toLocaleString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total nSFR Incidents" value={fmt(totalRefunds + totalPF)} sub="Refunds + PF combined" color="red" />
        <StatCard label="Refund Incidents" value={fmt(totalRefunds)} sub="Customer-reported failures" color="orange" />
        <StatCard label="Product Failures" value={fmt(totalPF)} sub="Pick-level failures" color="purple" />
        <StatCard label="Total Financial Loss" value={fmtKES(totalAmount)} sub="Refunds + Compensation (EUR)" color="blue" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly nSFR Trend — Both Stores Combined</CardTitle>
        </CardHeader>
        <CardContent>
          <OverviewCharts combinedTrend={combinedTrend} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {storeStats.map(s => {
          const slug = s.store.includes('TimauRd') ? 'nbof1' : 'nbof3'
          const maxVal = Math.max(...s.trend.map(x => x.refunds + x.pf), 1)
          return (
            <Link key={s.store} href={`/store/${slug}`}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{s.store}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Click to view full store analysis →</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold">
                    {s.store.includes('TimauRd') ? 'N1' : 'N3'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center bg-red-50 rounded-lg p-2">
                    <div className="text-xl font-bold text-red-600">{fmt(s.refunds)}</div>
                    <div className="text-xs text-red-500">Refunds</div>
                  </div>
                  <div className="text-center bg-orange-50 rounded-lg p-2">
                    <div className="text-xl font-bold text-orange-600">{fmt(s.pf)}</div>
                    <div className="text-xs text-orange-500">PF</div>
                  </div>
                  <div className="text-center bg-blue-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-blue-600">{fmtKES(s.amount)}</div>
                    <div className="text-xs text-blue-500">Loss</div>
                  </div>
                </div>
                <div className="flex items-end gap-0.5 h-10">
                  {s.trend.slice(-14).map((d, i) => {
                    const h = Math.max(4, ((d.refunds + d.pf) / maxVal) * 100)
                    return <div key={i} className="flex-1 bg-slate-200 group-hover:bg-blue-200 rounded-sm transition-colors" style={{ height: `${h}%` }} />
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-1">nSFR weekly trend (last 14 weeks)</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-500 text-lg">⚠</span>
        <div className="text-sm">
          <span className="font-semibold text-amber-800">Action Required:</span>
          <span className="text-amber-700"> 71.6% of all Product Failures are Inventory Inaccuracy (ghost stock). Cyka Fresh Limited drives 12.4% of all refund incidents. Immediate cycle count and supplier SLA action needed.</span>
        </div>
      </div>
    </div>
  )
}
