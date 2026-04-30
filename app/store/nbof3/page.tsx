import { StoreDetailPage } from '@/components/dashboard/StoreDetailPage'

export const revalidate = 60
export const metadata = { title: 'NBOF3 Safari — nSFR Dashboard' }

export default function NBOF3Page() {
  return <StoreDetailPage store="NBOF3 - Safari" slug="nbof3" />
}
