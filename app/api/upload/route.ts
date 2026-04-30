import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createServiceClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export const maxDuration = 60

interface RefundRow {
  Country?: string
  Store?: string
  'Order Date'?: string | number
  'Order Start Time (local)'?: string | number
  'Order Drop-off by Rider (local)'?: string | number
  'Order Id'?: number
  'Split / Stacked'?: string
  'Picker Id'?: number
  'Picker Name'?: string
  'Rider Id'?: number
  SKU?: string | number
  'Product Name'?: string
  'Category L1'?: string
  'Category L2'?: string
  'Supplier Name'?: string
  Event?: string
  CCR3?: string
  origin?: string
  Refund?: number
  Compensation?: number
  'Refund & Comp'?: number
  week?: number | string
}

interface PFRow {
  Store?: string
  'Order ID'?: number
  order_placed_localtime_at_date?: string
  'Order Placement (Local)'?: string
  SKU?: string | number
  'SKU Name'?: string
  'Qty Ordered'?: number
  'Qty Delivered'?: number
  'On Hand Qty Before Order'?: number
  'On Hand Qty Delta'?: number
  'On Hand Qty After Order'?: number
  'Reserved Qty Before Order'?: number
  'Reserved Qty Delta'?: number
  'Sales Buffer'?: number
  'IM Avail.'?: number
  'IM Avail. - Qty Ord'?: number
  'PF Root Cause'?: string
  Week?: number | string
  'Picker Name'?: string
}

function parseExcelDate(v: unknown): string | null {
  if (!v) return null
  if (v instanceof Date) return v.toISOString().split('T')[0]
  if (typeof v === 'number') {
    const date = XLSX.SSF.parse_date_code(v)
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
  }
  if (typeof v === 'string') return v.split('T')[0].split(' ')[0]
  return null
}

function parseExcelDateTime(v: unknown): string | null {
  if (!v) return null
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'number') {
    const date = XLSX.SSF.parse_date_code(v)
    if (date) {
      return new Date(date.y, date.m - 1, date.d, date.H ?? 0, date.M ?? 0, date.S ?? 0).toISOString()
    }
  }
  if (typeof v === 'string') return new Date(v).toISOString()
  return null
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    const buffer = Buffer.from(await file.arrayBuffer())

    const batchId = randomUUID()
    const supabase = createServiceClient()

    let refundRows: RefundRow[] = []
    let pfRows: PFRow[] = []

    if (ext === 'csv') {
      // Single CSV - try to detect type by headers
      const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<RefundRow | PFRow>(ws, { raw: false, defval: null })
      if (data.length > 0 && 'CCR3' in data[0]) {
        refundRows = data as RefundRow[]
      } else if (data.length > 0 && 'PF Root Cause' in data[0]) {
        pfRows = data as PFRow[]
      }
    } else {
      // Excel with multiple sheets
      const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
      const refundSheet = wb.Sheets['Refunds'] ?? wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('refund')) ?? '']
      const pfSheet = wb.Sheets['Product Failure'] ?? wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('product') || n.toLowerCase().includes('failure') || n.toLowerCase().includes('pf')) ?? '']

      if (refundSheet) {
        refundRows = XLSX.utils.sheet_to_json<RefundRow>(refundSheet, { raw: false, defval: null })
      }
      if (pfSheet) {
        pfRows = XLSX.utils.sheet_to_json<PFRow>(pfSheet, { raw: false, defval: null })
      }
    }

    // Process refunds in chunks
    const refundInserts = refundRows
      .filter(r => r.Store || r['Store'])
      .map(r => ({
        country: r.Country ?? 'Kenya',
        store: String(r.Store ?? '').trim(),
        order_date: parseExcelDate(r['Order Date']),
        order_start_time: parseExcelDateTime(r['Order Start Time (local)']),
        order_dropoff_time: parseExcelDateTime(r['Order Drop-off by Rider (local)']),
        order_id: r['Order Id'] ? Number(r['Order Id']) : null,
        split_stacked: r['Split / Stacked'] ?? null,
        picker_id: r['Picker Id'] ? Number(r['Picker Id']) : null,
        picker_name: r['Picker Name'] ?? null,
        rider_id: r['Rider Id'] ? Number(r['Rider Id']) : null,
        sku: r.SKU ? String(r.SKU) : null,
        product_name: r['Product Name'] !== 'null' ? (r['Product Name'] ?? null) : null,
        category_l1: r['Category L1'] !== 'null' ? (r['Category L1'] ?? null) : null,
        category_l2: r['Category L2'] !== 'null' ? (r['Category L2'] ?? null) : null,
        supplier_name: r['Supplier Name'] !== 'null' ? (r['Supplier Name'] ?? null) : null,
        event: r.Event ?? null,
        ccr3: r.CCR3 ?? null,
        origin: r.origin ?? null,
        refund: r.Refund ? Number(r.Refund) : 0,
        compensation: r.Compensation ? Number(r.Compensation) : 0,
        refund_and_comp: r['Refund & Comp'] ? Number(r['Refund & Comp']) : 0,
        week: r.week && !isNaN(Number(r.week)) ? Number(r.week) : null,
        upload_batch_id: batchId,
      }))

    const pfInserts = pfRows
      .filter(r => r.Store)
      .map(r => ({
        store: String(r.Store ?? '').trim(),
        order_id: r['Order ID'] ? Number(r['Order ID']) : null,
        order_date: parseExcelDate(r.order_placed_localtime_at_date),
        order_placement_time: parseExcelDateTime(r['Order Placement (Local)']),
        sku: r.SKU ? String(r.SKU) : null,
        sku_name: r['SKU Name'] ?? null,
        qty_ordered: r['Qty Ordered'] ? Number(r['Qty Ordered']) : null,
        qty_delivered: r['Qty Delivered'] ? Number(r['Qty Delivered']) : null,
        on_hand_qty_before: r['On Hand Qty Before Order'] ? Number(r['On Hand Qty Before Order']) : null,
        on_hand_qty_delta: r['On Hand Qty Delta'] ? Number(r['On Hand Qty Delta']) : null,
        on_hand_qty_after: r['On Hand Qty After Order'] ? Number(r['On Hand Qty After Order']) : null,
        reserved_qty_before: r['Reserved Qty Before Order'] ? Number(r['Reserved Qty Before Order']) : null,
        reserved_qty_delta: r['Reserved Qty Delta'] ? Number(r['Reserved Qty Delta']) : null,
        sales_buffer: r['Sales Buffer'] ? Number(r['Sales Buffer']) : null,
        im_avail: r['IM Avail.'] ? Number(r['IM Avail.']) : null,
        im_avail_minus_qty_ord: r['IM Avail. - Qty Ord'] ? Number(r['IM Avail. - Qty Ord']) : null,
        pf_root_cause: r['PF Root Cause'] ?? null,
        week: r.Week && !isNaN(Number(r.Week)) ? Number(r.Week) : null,
        picker_name: r['Picker Name'] ?? null,
        upload_batch_id: batchId,
      }))

    // Insert in chunks of 500
    const CHUNK = 500
    for (let i = 0; i < refundInserts.length; i += CHUNK) {
      const { error } = await supabase.from('refunds').insert(refundInserts.slice(i, i + CHUNK))
      if (error) throw new Error(`Refund insert error: ${error.message}`)
    }
    for (let i = 0; i < pfInserts.length; i += CHUNK) {
      const { error } = await supabase.from('product_failures').insert(pfInserts.slice(i, i + CHUNK))
      if (error) throw new Error(`PF insert error: ${error.message}`)
    }

    // Collect metadata
    const stores = [...new Set([
      ...refundInserts.map(r => r.store),
      ...pfInserts.map(p => p.store),
    ])].filter(Boolean)

    const allWeeks = [
      ...refundInserts.map(r => r.week),
      ...pfInserts.map(p => p.week),
    ].filter((w): w is number => typeof w === 'number')
    const minWeek = allWeeks.length ? Math.min(...allWeeks) : null
    const maxWeek = allWeeks.length ? Math.max(...allWeeks) : null
    const weekRange = minWeek && maxWeek ? `W${minWeek}–W${maxWeek}` : 'Unknown'

    const batch = {
      id: batchId,
      filename: file.name,
      uploaded_at: new Date().toISOString(),
      refund_count: refundInserts.length,
      pf_count: pfInserts.length,
      stores,
      week_range: weekRange,
    }
    await supabase.from('upload_batches').insert(batch)

    return NextResponse.json({ ...batch, refund_count: refundInserts.length, pf_count: pfInserts.length, batch })
  } catch (err: unknown) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
