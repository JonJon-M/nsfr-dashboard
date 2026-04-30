'use client'

interface Picker {
  name: string
  refunds: number
  pf: number
  total: number
}

export function PickerTable({ pickers, store }: { pickers: Picker[]; store: string }) {
  const maxTotal = Math.max(...pickers.map(p => p.total), 1)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Picker</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-red-500 uppercase">Refunds</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-orange-500 uppercase">PF</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-700 uppercase">Total</th>
            <th className="py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Risk</th>
          </tr>
        </thead>
        <tbody>
          {pickers.map((p, i) => (
            <tr key={p.name} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-2 px-3 font-medium text-slate-700">
                <span className="text-slate-400 mr-2">{i + 1}.</span>{p.name}
              </td>
              <td className="py-2 px-3 text-right text-red-600 font-medium">{p.refunds}</td>
              <td className="py-2 px-3 text-right text-orange-600 font-medium">{p.pf}</td>
              <td className="py-2 px-3 text-right font-bold text-slate-800">{p.total}</td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                      style={{ width: `${(p.total / maxTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">
                    {((p.total / maxTotal) * 100).toFixed(0)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
