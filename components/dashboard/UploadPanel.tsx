'use client'
import { useState, useRef } from 'react'

interface UploadBatch {
  id: string
  filename: string
  uploaded_at: string
  refund_count: number
  pf_count: number
  stores: string[]
  week_range: string
}

export function UploadPanel({ batches: initialBatches }: { batches: UploadBatch[] }) {
  const [batches, setBatches] = useState(initialBatches)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    setProgress('Parsing file...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setProgress(`✅ Uploaded: ${data.refund_count} refunds, ${data.pf_count} PF records`)
      setBatches(prev => [data.batch, ...prev])
      if (fileRef.current) fileRef.current.value = ''
      setTimeout(() => { setProgress(''); window.location.reload() }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-700 mb-1">Upload New Data</h3>
        <p className="text-sm text-slate-500 mb-4">
          Upload your nSFR Excel file (.xlsx) or CSV. The system accepts the same format as the original data export — sheets named <strong>Refunds</strong> and <strong>Product Failure</strong>.
        </p>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv,.xls"
            required
            className="flex-1 text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer border border-blue-200 rounded-lg bg-white py-1.5 px-2"
          />
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </form>
        {progress && (
          <p className="mt-3 text-sm text-blue-700 font-medium">{progress}</p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-600">⚠️ {error}</p>
        )}
      </div>

      {/* Upload history */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3">Upload History</h3>
        {batches.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No uploads yet. Upload your first file above.</p>
        ) : (
          <div className="space-y-2">
            {batches.map(b => (
              <div key={b.id} className="border border-slate-200 rounded-lg p-4 bg-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-700 text-sm">📎 {b.filename}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(b.uploaded_at).toLocaleString()} · {b.week_range}
                  </p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                    {b.refund_count} refunds
                  </span>
                  <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                    {b.pf_count} PF
                  </span>
                  <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                    {b.stores?.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
