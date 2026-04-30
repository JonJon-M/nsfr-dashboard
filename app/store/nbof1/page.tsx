import { StoreDetailPage } from '@/components/dashboard/StoreDetailPage'

export const revalidate = 60
export const metadata = { title: 'NBOF1 TimauRd — nSFR Dashboard' }

export default function NBOF1Page() {
  return <StoreDetailPage store="NBOF1 - TimauRd" slug="nbof1" />
}
