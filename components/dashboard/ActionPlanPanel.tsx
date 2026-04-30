'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import type { ActionPlan } from '@/lib/types'

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Critical',
  2: 'High',
  3: 'High',
  4: 'Medium',
  5: 'Medium',
}

const PRIORITY_COLORS: Record<number, string> = {
  1: 'red',
  2: 'orange',
  3: 'orange',
  4: 'yellow',
  5: 'blue',
}

const STATUS_OPTIONS = ['pending', 'in-progress', 'completed', 'blocked']

export function ActionPlanPanel({ plans: initialPlans }: { plans: ActionPlan[] }) {
  const [plans, setPlans] = useState(initialPlans)
  const [saving, setSaving] = useState<number | null>(null)

  const grouped = plans.reduce<Record<string, ActionPlan[]>>((acc, p) => {
    const key = `${p.priority}-${p.category}`
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  async function updateStatus(id: number, status: string) {
    setSaving(id)
    await supabase.from('action_plans').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    setSaving(null)
  }

  async function updateNotes(id: number, notes: string) {
    await supabase.from('action_plans').update({ notes, updated_at: new Date().toISOString() }).eq('id', id)
    setPlans(prev => prev.map(p => p.id === id ? { ...p, notes } : p))
  }

  const completedCount = plans.filter(p => p.status === 'completed').length
  const inProgressCount = plans.filter(p => p.status === 'in-progress').length

  return (
    <div>
      <div className="flex gap-4 mb-5">
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
          <div className="text-lg font-bold text-green-700">{completedCount}</div>
          <div className="text-xs text-green-600">Completed</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-center">
          <div className="text-lg font-bold text-orange-700">{inProgressCount}</div>
          <div className="text-xs text-orange-600">In Progress</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
          <div className="text-lg font-bold text-slate-700">{plans.length - completedCount - inProgressCount}</div>
          <div className="text-xs text-slate-600">Pending / Blocked</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
          <div className="text-lg font-bold text-blue-700">{Math.round((completedCount / plans.length) * 100)}%</div>
          <div className="text-xs text-blue-600">Overall Progress</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex text-xs text-slate-500 justify-between mb-1">
          <span>Overall completion</span>
          <span>{completedCount}/{plans.length} actions</span>
        </div>
        <div className="bg-slate-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-green-500 transition-all duration-500"
            style={{ width: `${(completedCount / plans.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([key, group]) => {
            const { priority, category } = group[0]
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={PRIORITY_COLORS[priority] as string}>
                    P{priority} — {PRIORITY_LABELS[priority]}
                  </Badge>
                  <span className="font-semibold text-slate-700">{category}</span>
                </div>
                <div className="space-y-3">
                  {group.map(plan => (
                    <div key={plan.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-slate-700 flex-1">{plan.action}</p>
                        <select
                          value={plan.status}
                          onChange={e => updateStatus(plan.id, e.target.value)}
                          disabled={saving === plan.id}
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span>👤 {plan.owner}</span>
                        <span>📅 {plan.timeline}</span>
                        <Badge variant={plan.status as string}>{plan.status}</Badge>
                      </div>
                      <input
                        type="text"
                        placeholder="Add notes / progress update..."
                        defaultValue={plan.notes ?? ''}
                        onBlur={e => updateNotes(plan.id, e.target.value)}
                        className="w-full text-xs border border-slate-100 rounded px-2 py-1 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-slate-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
