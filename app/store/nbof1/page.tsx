import { StoreDetailPage } from '@/components/dashboard/StoreDetailPage'

export const revalidate = 0
export const metadata = { title: 'NBOF1 TimauRd — nSFR Dashboard' }

export default async function NBOF1Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from, to } = await searchParams
  return <StoreDetailPage store="NBOF1 - TimauRd" slug="nbof1" dateFrom={from} dateTo={to} />
}
