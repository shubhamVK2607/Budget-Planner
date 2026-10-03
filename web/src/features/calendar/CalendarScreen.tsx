import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Category, Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatShortDate, getToday } from '../../shared/utils/date'
import { getCurrentMonth, getDailyLimitOn, getDaysInMonth, getStatus } from '../budget/budget'
import { forDate, forMonth, ofKind, sumAmount } from '../expenses/expenses'
import ExpenseRow from '../expenses/ExpenseRow'

type Props = {
  budget: MonthBudget
  categories: Category[]
  expenses: Expense[]
  onAddClick: (date: string) => void
  onExpenseClick: (expense: Expense) => void
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const cellStyle = {
  green: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  future: 'bg-slate-50 text-slate-300',
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n))

export default function CalendarScreen({ budget, categories, expenses, onAddClick, onExpenseClick }: Props) {
  const today = getToday()
  const [selected, setSelected] = useState<string | null>(
    budget.month === getCurrentMonth() ? today : null
  )

  const [year, m] = budget.month.split('-').map(Number)
  const daysInMonth = getDaysInMonth(budget.month)
  const startOffset = new Date(year, m - 1, 1).getDay() // 0 = Sunday
  const monthExpenses = forMonth(expenses, budget.month)

  const dateOf = (day: number) => `${budget.month}-${String(day).padStart(2, '0')}`
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Unknown'

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const dayExpenses = selected ? forDate(monthExpenses, selected) : []
  const dayRegular = sumAmount(ofKind(dayExpenses, 'regular'))
  const dayExtra = sumAmount(ofKind(dayExpenses, 'extra'))
  const dayLimit = selected ? getDailyLimitOn(budget, expenses, selected) : 0
  const canAdd = selected !== null && selected <= today

  return (
    <div className="p-5">
      <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const date = dateOf(day)
          const isFuture = date > today
          const dayList = forDate(monthExpenses, date)
          const regular = sumAmount(ofKind(dayList, 'regular'))
          const hasExtra = ofKind(dayList, 'extra').length > 0
          const limit = getDailyLimitOn(budget, expenses, date)
          const style = isFuture ? cellStyle.future : cellStyle[getStatus(regular, limit)]

          return (
            <button
              key={date}
              disabled={isFuture}
              onClick={() => setSelected(date)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold ${style} ${
                selected === date ? 'ring-2 ring-indigo-600' : ''
              } ${date === today ? 'underline underline-offset-2' : ''}`}
            >
              {day}
              <span className="text-[10px] font-medium leading-none">
                {!isFuture && regular > 0 ? compact(regular) : ''}
              </span>
              {hasExtra && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-orange-500" />}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>🟩 Within limit</span>
        <span>🟨 Close to limit</span>
        <span>🟥 Over limit</span>
        <span>⬜ Upcoming</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> Extra expense
        </span>
      </div>

      {selected && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">{formatShortDate(selected)}</div>
              <div className="text-sm text-slate-500">
                Regular {rupee(dayRegular)} / {rupee(dayLimit)}
              </div>
              {dayExtra > 0 && (
                <div className="text-sm text-orange-600">
                  + {rupee(dayExtra)} extra (not counted in daily limit)
                </div>
              )}
            </div>
            {canAdd && (
              <button
                onClick={() => onAddClick(selected)}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>

          {dayExpenses.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-slate-400">No expenses on this day</p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {dayExpenses.map((e) => (
                <ExpenseRow
                  key={e.id}
                  expense={e}
                  categoryName={catName(e.categoryId)}
                  onClick={() => onExpenseClick(e)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}