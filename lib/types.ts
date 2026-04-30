export interface Refund {
  id: number
  store: string
  order_date: string
  order_id: number
  picker_name: string
  sku: string
  product_name: string
  category_l1: string
  supplier_name: string
  ccr3: string
  refund: number
  compensation: number
  refund_and_comp: number
  week: number
  split_stacked: string
}

export interface ProductFailure {
  id: number
  store: string
  order_id: number
  order_date: string
  sku: string
  sku_name: string
  qty_ordered: number
  qty_delivered: number
  pf_root_cause: string
  week: number
  picker_name: string
}

export interface ActionPlan {
  id: number
  store: string
  priority: number
  category: string
  action: string
  owner: string
  timeline: string
  status: string
  notes: string
}

export interface UploadBatch {
  id: string
  filename: string
  uploaded_at: string
  refund_count: number
  pf_count: number
  stores: string[]
  week_range: string
}

export interface StoreMetrics {
  store: string
  totalRefunds: number
  totalPF: number
  totalNSFR: number
  refundAmount: number
  weeklyRefunds: { week: number; count: number; amount: number }[]
  weeklyPF: { week: number; count: number }[]
  ccr3Breakdown: { name: string; value: number }[]
  pfBreakdown: { name: string; value: number }[]
  topSuppliers: { name: string; count: number }[]
  topCategories: { name: string; count: number }[]
  topPickers: { name: string; refunds: number; pf: number; total: number }[]
  topPFSkus: { sku: string; name: string; count: number; cause: string }[]
}
