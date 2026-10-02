import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { Category, Expense } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { sumAmount, totalsByCategory } from '../expenses/expenses'
import ExpenseRow from '../expenses/ExpenseRow'

type Props = {
  categories: Category[]
  monthExpenses: Expense[]
  onExpenseClick: (expense: Expense) => void
}

export default function CategoriesScreen({ categories, monthExpenses, onExpenseClick }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const totals = totalsByCategory(monthExpenses)
  const monthTotal = sumAmount(monthExpenses)
  const selected = categories.find((c) => c.id === selectedId)

  if (selected) {
    const list = monthExpenses
      .filter((e) => e.categoryId === selected.id)
      .sort((a, b) => b.date.localeCompare(a.date))

    return (
      <div className="p-5">
        <button className="mb-3 flex items-center gap-1 text-slate-500" onClick={() => setSelectedId(null)}>
          <ArrowLeft size={18} /> All categories
        </button>
        <h2 className="text-2xl font-bold">{selected.name}</h2>
        <div className="mb-4 text-3xl font-bold text-indigo-600">{rupee(totals[selected.id] ?? 0)}</div>

        {list.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-slate-400">No expenses in this category</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {list.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                categoryName={selected.name}
                showDate
                onClick={() => onExpenseClick(e)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const visible = categories.filter((c) => !c.archived || (totals[c.id] ?? 0) > 0)

  return (
    <div className="p-5">
      <div className="mb-2 text-sm font-medium text-slate-500">CATEGORIES</div>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {visible.map((c) => {
          const total = totals[c.id] ?? 0
          const percent = monthTotal > 0 ? Math.round((total / monthTotal) * 100) : 0
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>{c.name}</span>
                  <b>{rupee(total)}</b>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}