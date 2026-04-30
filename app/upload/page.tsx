import { supabase } from '@/lib/supabase'
import { UploadPanel } from '@/components/dashboard/UploadPanel'

export const metadata = { title: 'Upload Data — nSFR Dashboard' }

export default async function UploadPage() {
  const { data: batches } = await supabase
    .from('upload_batches')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload nSFR Data</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload new weekly exports to refresh the dashboard. Data is appended — existing records are preserved.
          Each upload is tracked with a batch ID for auditability.
        </p>
      </div>

      {/* Format guide */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 mb-3 text-sm">Accepted Formats</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="font-medium text-slate-700 mb-1">Excel (.xlsx)</div>
            <div className="text-xs text-slate-500 space-y-0.5">
              <div>Sheet 1: <code className="bg-slate-100 px-1 rounded">Refunds</code></div>
              <div>Sheet 2: <code className="bg-slate-100 px-1 rounded">Product Failure</code></div>
              <div className="text-green-600 font-medium mt-1">✓ Recommended</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="font-medium text-slate-700 mb-1">CSV (.csv)</div>
            <div className="text-xs text-slate-500 space-y-0.5">
              <div>Either Refunds or PF data</div>
              <div>Headers must match original export</div>
              <div className="text-blue-600 font-medium mt-1">✓ Supported</div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          <strong>Required columns (Refunds):</strong> Store, Order Date, Picker Name, SKU, CCR3, Refund & Comp, week<br />
          <strong>Required columns (PF):</strong> Store, SKU, SKU Name, Qty Ordered, Qty Delivered, PF Root Cause, Week, Picker Name
        </div>
      </div>

      <UploadPanel batches={batches ?? []} />
    </div>
  )
}
