import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { Category, Expense, Kind } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { kindOf } from '../../shared/utils/kind'
import { sumAmount, totalsByCategory } from '../expenses/expenses'
import ExpenseRow from '../expenses/ExpenseRow'

type Props = {
  categories: Category[]
  monthExpenses: Expense[]
  onExpenseClick: (expense: Expense) => void
}

const SECTIONS: { kind: Kind; title: string }[] = [
  { kind: 'regular', title: 'REGULAR' },
  { kind: 'extra', title: 'EXTRA' },
]

export default function CategoriesScreen({ categories, monthExpenses, onExpenseClick }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const totals = totalsByCategory(monthExpenses)
  const selected = categories.find((c) => c.id === selectedId)

  if (selected) {
    const list = monthExpenses
      .filter((e) => e.categoryId === selected.id)
      .sort((a, b) => b.date.localeCompare(a.date))

    return (
      <div className="p-5">
        <button className="mb-3 cursor-pointer flex items-center gap-1 text-slate-500" onClick={() => setSelectedId(null)}>
          <ArrowLeft size={18} /> All categories
        </button>
        <div className="text-sm font-medium text-slate-500">{kindOf(selected).toUpperCase()}</div>
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

  return (
    <div className="space-y-5 p-5">
      {SECTIONS.map(({ kind, title }) => {
        const kindExpenses = monthExpenses.filter((e) => (e.kind ?? 'regular') === kind)
        const kindTotal = sumAmount(kindExpenses)
        const rows = categories.filter(
          (c) => kindOf(c) === kind && (!c.archived || (totals[c.id] ?? 0) > 0)
        )

        return (
          <div key={kind}>
            <div className="mb-2 flex justify-between text-sm font-medium text-slate-500">
              <span>{title}</span>
              <span>{rupee(kindTotal)}</span>
            </div>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {rows.map((c) => {
                const total = totals[c.id] ?? 0
                const hasExpenses = monthExpenses.some((e) => e.categoryId === c.id)
                const percent = kindTotal > 0 ? Math.round((total / kindTotal) * 100) : 0
                return (
                  <button
                    key={c.id}
                    disabled={!hasExpenses}
                    onClick={() => setSelectedId(c.id)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left ${hasExpenses ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    <span className={total > 0 ? '' : 'text-slate-400'}>{c.name}</span>
                    <span className="flex items-center gap-2">
                      {total > 0 && <span className="text-xs text-slate-400">{percent}%</span>}
                      <b className={total > 0 ? '' : 'font-medium text-slate-300'}>{rupee(total)}</b>
                      {hasExpenses && <ChevronRight size={18} className="text-slate-300" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}