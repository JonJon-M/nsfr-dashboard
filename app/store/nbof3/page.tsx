import { StoreDetailPage } from '@/components/dashboard/StoreDetailPage'

export const revalidate = 0
export const metadata = { title: 'NBOF3 Safari — nSFR Dashboard' }

export default async function NBOF3Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from, to } = await searchParams
  return <StoreDetailPage store="NBOF3 - Safari" slug="nbof3" dateFrom={from} dateTo={to} />
}
