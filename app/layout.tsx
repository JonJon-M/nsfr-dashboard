import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '@/components/dashboard/NavBar'

export const metadata: Metadata = {
  title: 'nSFR Dashboard — Darkstore Operations',
  description: 'Non-Seamless Fulfilment Rate monitoring for NBOF1 TimauRd & NBOF3 Safari',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">
        <NavBar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white mt-8 py-4 px-6 text-center text-xs text-slate-400">
          nSFR Dashboard · NBOF Operations · Data refreshed on upload
        </footer>
      </body>
    </html>
  )
}
