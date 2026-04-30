import { supabase } from './supabase'
import type { StoreMetrics } from './types'

export async function fetchStoreMetrics(store: string): Promise<StoreMetrics> {
  const [refundsRes, pfRes] = await Promise.all([
    supabase.from('refunds').select('*').eq('store', store),
    supabase.from('product_failures').select('*').eq('store', store),
  ])

  const refunds = refundsRes.data ?? []
  const pfs = pfRes.data ?? []

  const totalRefunds = refunds.length
  const totalPF = pfs.length
  const refundAmount = refunds.reduce((s, r) => s + (r.refund_and_comp ?? 0), 0)

  // Weekly
  const weeklyRefundsMap: Record<number, { count: number; amount: number }> = {}
  refunds.forEach(r => {
    if (!r.week || typeof r.week !== 'number') return
    if (!weeklyRefundsMap[r.week]) weeklyRefundsMap[r.week] = { count: 0, amount: 0 }
    weeklyRefundsMap[r.week].count++
    weeklyRefundsMap[r.week].amount += r.refund_and_comp ?? 0
  })

  const weeklyPFMap: Record<number, number> = {}
  pfs.forEach(p => {
    if (!p.week || typeof p.week !== 'number') return
    weeklyPFMap[p.week] = (weeklyPFMap[p.week] ?? 0) + 1
  })

  const allWeeks = Array.from(new Set([
    ...Object.keys(weeklyRefundsMap).map(Number),
    ...Object.keys(weeklyPFMap).map(Number),
  ])).sort((a, b) => a - b)

  const weeklyRefunds = allWeeks.map(w => ({
    week: w,
    count: weeklyRefundsMap[w]?.count ?? 0,
    amount: weeklyRefundsMap[w]?.amount ?? 0,
  }))
  const weeklyPF = allWeeks.map(w => ({ week: w, count: weeklyPFMap[w] ?? 0 }))

  // CCR3
  const ccr3Map: Record<string, number> = {}
  refunds.forEach(r => {
    if (r.ccr3) ccr3Map[r.ccr3] = (ccr3Map[r.ccr3] ?? 0) + 1
  })
  const ccr3Breakdown = Object.entries(ccr3Map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  // PF causes
  const pfMap: Record<string, number> = {}
  pfs.forEach(p => {
    if (p.pf_root_cause) pfMap[p.pf_root_cause] = (pfMap[p.pf_root_cause] ?? 0) + 1
  })
  const pfBreakdown = Object.entries(pfMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  // Top suppliers (exclude null)
  const supMap: Record<string, number> = {}
  refunds.forEach(r => {
    if (r.supplier_name && r.supplier_name !== 'null') {
      supMap[r.supplier_name] = (supMap[r.supplier_name] ?? 0) + 1
    }
  })
  const topSuppliers = Object.entries(supMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))

  // Top categories (exclude null)
  const catMap: Record<string, number> = {}
  refunds.forEach(r => {
    if (r.category_l1 && r.category_l1 !== 'null') {
      catMap[r.category_l1] = (catMap[r.category_l1] ?? 0) + 1
    }
  })
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))

  // Picker cross-analysis
  const pickerRefunds: Record<string, number> = {}
  const pickerPF: Record<string, number> = {}
  refunds.forEach(r => {
    if (r.picker_name) pickerRefunds[r.picker_name] = (pickerRefunds[r.picker_name] ?? 0) + 1
  })
  pfs.forEach(p => {
    if (p.picker_name) pickerPF[p.picker_name] = (pickerPF[p.picker_name] ?? 0) + 1
  })
  const allPickers = Array.from(new Set([...Object.keys(pickerRefunds), ...Object.keys(pickerPF)]))
  const topPickers = allPickers
    .map(name => ({
      name,
      refunds: pickerRefunds[name] ?? 0,
      pf: pickerPF[name] ?? 0,
      total: (pickerRefunds[name] ?? 0) + (pickerPF[name] ?? 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Top PF SKUs
  const skuMap: Record<string, { name: string; count: number; causes: Record<string, number> }> = {}
  pfs.forEach(p => {
    const key = String(p.sku)
    if (!skuMap[key]) skuMap[key] = { name: p.sku_name ?? key, count: 0, causes: {} }
    skuMap[key].count++
    if (p.pf_root_cause) {
      skuMap[key].causes[p.pf_root_cause] = (skuMap[key].causes[p.pf_root_cause] ?? 0) + 1
    }
  })
  const topPFSkus = Object.entries(skuMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([sku, v]) => ({
      sku,
      name: v.name,
      count: v.count,
      cause: Object.entries(v.causes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '',
    }))

  return {
    store,
    totalRefunds,
    totalPF,
    totalNSFR: totalRefunds + totalPF,
    refundAmount,
    weeklyRefunds,
    weeklyPF,
    ccr3Breakdown,
    pfBreakdown,
    topSuppliers,
    topCategories,
    topPickers,
    topPFSkus,
  }
}

export async function fetchAllMetrics() {
  const [nbof1, nbof3] = await Promise.all([
    fetchStoreMetrics('NBOF1 - TimauRd'),
    fetchStoreMetrics('NBOF3 - Safari'),
  ])
  return { nbof1, nbof3 }
}
