import { useState } from 'react'
import type { Category, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { getDailyLimit, getTotalFixed } from '../budget/budget'

type Props = {
  categories: Category[]
  onAddCategory: (name: string) => void
  onToggleArchive: (id: string) => void
  onBack: () => void
  budget: MonthBudget
  onEditBudget: () => void
}

export default function SettingsScreen({ categories, onAddCategory, onToggleArchive, onBack, budget, onEditBudget }: Props) {
  const [name, setName] = useState('')

  const active = categories.filter((c) => !c.archived)
  const hidden = categories.filter((c) => c.archived)
  const trimmed = name.trim()
  const duplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())

  const add = () => {
    if (!trimmed || duplicate) return
    onAddCategory(trimmed)
    setName('')
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <button className="text-2xl" onClick={onBack}>←</button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="mb-2 text-sm font-medium text-slate-500">BUDGET</div>
<div className="mb-6 rounded-2xl border border-slate-100 p-4">
  <div className="flex justify-between"><span>Income</span><b>{rupee(budget.income)}</b></div>
  <div className="flex justify-between"><span>Fixed expenses</span><b>{rupee(getTotalFixed(budget))}</b></div>
  <div className="flex justify-between">
    <span>Daily limit ({budget.dailyLimitMode})</span>
    <b>{rupee(getDailyLimit(budget))}</b>
  </div>
  <button
    onClick={onEditBudget}
    className="mt-3 w-full rounded-xl border border-indigo-600 py-2 font-semibold text-indigo-600"
  >
    Edit budget
  </button>
</div>

      <div className="mb-2 text-sm font-medium text-slate-500">CATEGORIES</div>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {active.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <span>{c.name}</span>
            <button
              disabled={active.length === 1}
              onClick={() => onToggleArchive(c.id)}
              className="text-sm text-slate-500 disabled:opacity-30"
            >
              Hide
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
        />
        <button
          disabled={!trimmed || duplicate}
          onClick={add}
          className="rounded-xl bg-indigo-600 px-5 font-semibold text-white disabled:bg-slate-300"
        >
          Add
        </button>
      </div>
      {duplicate && trimmed && <p className="mt-1 text-sm text-red-600">This category already exists</p>}

      {hidden.length > 0 && (
        <>
          <div className="mb-2 mt-6 text-sm font-medium text-slate-500">HIDDEN</div>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {hidden.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 text-slate-400">
                <span>{c.name}</span>
                <button onClick={() => onToggleArchive(c.id)} className="text-sm text-indigo-600">
                  Restore
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}