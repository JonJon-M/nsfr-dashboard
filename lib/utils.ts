import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-EU', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
}

export function fmtKES(n: number) {
  return `€${n.toLocaleString('en-EU', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

export const STORES = ['NBOF1 - TimauRd', 'NBOF3 - Safari'] as const
export type Store = typeof STORES[number]

export const CCR3_COLORS: Record<string, string> = {
  'Missing item': '#ef4444',
  'Product Quality': '#f97316',
  'Wrong item': '#eab308',
  'Damaged item': '#8b5cf6',
  'Order never arrived': '#ec4899',
  'Wrong order': '#14b8a6',
  'Food temperature': '#64748b',
}

export const PF_COLORS: Record<string, string> = {
  'Inventory Inaccuracy': '#ef4444',
  'No-found': '#f97316',
  'Avoidable': '#eab308',
  'Product Failure': '#8b5cf6',
}

export const STATUS_COLORS: Record<string, string> = {
  pending: '#64748b',
  'in-progress': '#f97316',
  completed: '#22c55e',
  blocked: '#ef4444',
}
