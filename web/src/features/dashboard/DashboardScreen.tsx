import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Category, Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { getToday } from '../../shared/utils/date'
import { getCurrentMonth, getDailyLimit, getPool, getStatus } from '../budget/budget'
import { forDate, forMonth, sumAmount } from '../expenses/expenses'
import ExpenseRow from '../expenses/ExpenseRow'

type Props = {
  budget: MonthBudget
  categories: Category[]
  expenses: Expense[]
  onAddClick: () => void
  onExpenseClick: (expense: Expense) => void
}

const statusStyle = {
  green: { card: 'border-emerald-200 bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'On track' },
  yellow: { card: 'border-amber-200 bg-amber-50', bar: 'bg-amber-400', text: 'text-amber-700', label: 'Close to limit' },
  red: { card: 'border-red-200 bg-red-50', bar: 'bg-red-500', text: 'text-red-700', label: 'Over limit' },
}

export default function DashboardScreen({ budget, categories, expenses, onAddClick, onExpenseClick }: Props) {
  const [range, setRange] = useState<'today' | 'month'>('today')
  const isCurrentMonth = budget.month === getCurrentMonth()
  const activeRange = isCurrentMonth ? range : 'month'

  const monthExpenses = forMonth(expenses, budget.month)
  const todayExpenses = forDate(expenses, getToday())
  const listExpenses =
    activeRange === 'today'
      ? [...todayExpenses].reverse()
      : [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date))

  const pool = getPool(budget)
  const dailyLimit = getDailyLimit(budget)
  const todaySpent = sumAmount(todayExpenses)
  const monthSpent = sumAmount(monthExpenses)
  const status = getStatus(todaySpent, dailyLimit)
  const style = statusStyle[status]

  const todayPercent =
    dailyLimit > 0 ? Math.min(100, Math.round((todaySpent / dailyLimit) * 100)) : todaySpent > 0 ? 100 : 0
  const monthPercent = pool > 0 ? Math.min(100, Math.round((monthSpent / pool) * 100)) : 0
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Unknown'

  return (
    <div className="space-y-4 p-5">
      {/* Today card (sirf current month) */}
      {isCurrentMonth && (
        <div className={`rounded-2xl border p-5 ${style.card}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">TODAY</span>
            <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${style.text}`}>
              {style.label}
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold">
            {rupee(todaySpent)}{' '}
            <span className="text-lg font-medium text-slate-400">/ {rupee(dailyLimit)}</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
            <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${todayPercent}%` }} />
          </div>
          <div className={`mt-2 text-sm font-medium ${style.text}`}>
            {todaySpent <= dailyLimit
              ? `${rupee(dailyLimit - todaySpent)} left today`
              : `${rupee(todaySpent - dailyLimit)} over today's limit`}
          </div>
        </div>
      )}

      {/* Month card */}
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="text-sm font-medium text-slate-500">THIS MONTH (Variable)</div>
        <div className="mt-1 text-xl font-bold">
          {rupee(monthSpent)}{' '}
          <span className="text-base font-medium text-slate-400">/ {rupee(pool)}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${monthSpent > pool ? 'bg-red-500' : 'bg-indigo-600'}`}
            style={{ width: `${monthPercent}%` }}
          />
        </div>
      </div>

      {/* Expenses + toggle */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-500">EXPENSES</div>
          {isCurrentMonth && (
            <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
              {(['today', 'month'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1 ${range === r ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                >
                  {r === 'today' ? 'Today' : 'This month'}
                </button>
              ))}
            </div>
          )}
        </div>

        {listExpenses.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-slate-400">
            {activeRange === 'today' ? 'No expenses today yet' : 'No expenses this month'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {listExpenses.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                categoryName={catName(e.categoryId)}
                showDate={activeRange === 'month'}
                onClick={() => onExpenseClick(e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating + (sirf current month) */}
      {isCurrentMonth && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-10 flex w-full max-w-[480px] -translate-x-1/2 justify-end px-5">
          <button
            onClick={onAddClick}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg"
          >
            <Plus size={28} />
          </button>
        </div>
      )}
    </div>
  )
}