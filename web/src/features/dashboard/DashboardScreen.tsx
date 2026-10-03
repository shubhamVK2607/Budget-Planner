import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Category, Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { getToday } from '../../shared/utils/date'
import {
  getCurrentMonth,
  getDailyLimit,
  getDailyLimitOn,
  getExtraBudget,
  getOverflow,
  getRegularBudget,
  getStatus,
} from '../budget/budget'
import { forDate, forMonth, ofKind, sumAmount } from '../expenses/expenses'
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

const percentOf = (spent: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : spent > 0 ? 100 : 0

export default function DashboardScreen({ budget, categories, expenses, onAddClick, onExpenseClick }: Props) {
  const [range, setRange] = useState<'today' | 'month'>('today')
  const today = getToday()
  const isCurrentMonth = budget.month === getCurrentMonth()
  const activeRange = isCurrentMonth ? range : 'month'

  const monthExpenses = forMonth(expenses, budget.month)
  const todayExpenses = forDate(expenses, today)
  const listExpenses =
    activeRange === 'today'
      ? [...todayExpenses].reverse()
      : [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date))

  // Today card: sirf Regular kharche
  const todaySpent = sumAmount(ofKind(todayExpenses, 'regular'))
  const baseLimit = getDailyLimit(budget)
  const todayLimit = isCurrentMonth ? getDailyLimitOn(budget, expenses, today) : baseLimit
  const status = getStatus(todaySpent, todayLimit)
  const style = statusStyle[status]

  // Regular month bar (overflow hone par regular budget kam ho jata hai)
  const regularSpent = sumAmount(ofKind(monthExpenses, 'regular'))
  const extraSpent = sumAmount(ofKind(monthExpenses, 'extra'))
  const extraBudget = getExtraBudget(budget)
  const overflow = getOverflow(budget, expenses)
  const regularBudget = Math.max(0, getRegularBudget(budget) - overflow)
  const extraOver = extraSpent > extraBudget

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Unknown'

  return (
    <div className="space-y-4 p-5">
      {/* Today card (sirf current month) */}
      {isCurrentMonth && (
        <div className={`rounded-2xl border p-5 ${style.card}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">TODAY · Regular</span>
            <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${style.text}`}>
              {style.label}
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold">
            {rupee(todaySpent)}{' '}
            <span className="text-lg font-medium text-slate-400">/ {rupee(todayLimit)}</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
            <div
              className={`h-full rounded-full ${style.bar}`}
              style={{ width: `${percentOf(todaySpent, todayLimit)}%` }}
            />
          </div>
          <div className={`mt-2 text-sm font-medium ${style.text}`}>
            {todaySpent <= todayLimit
              ? `${rupee(todayLimit - todaySpent)} left today`
              : `${rupee(todaySpent - todayLimit)} over today's limit`}
          </div>
          {todayLimit < baseLimit && (
            <div className="mt-1 text-xs text-slate-500">
              Reduced from {rupee(baseLimit)} because extra expenses went over budget.
            </div>
          )}
        </div>
      )}

      {/* Regular this month */}
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="text-sm font-medium text-slate-500">THIS MONTH · Regular</div>
        <div className="mt-1 text-xl font-bold">
          {rupee(regularSpent)}{' '}
          <span className="text-base font-medium text-slate-400">/ {rupee(regularBudget)}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${regularSpent > regularBudget ? 'bg-red-500' : 'bg-indigo-600'}`}
            style={{ width: `${percentOf(regularSpent, regularBudget)}%` }}
          />
        </div>
      </div>

      {/* Extra card */}
      <div className={`rounded-2xl border p-5 ${extraOver ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">THIS MONTH · Extra</span>
          {extraOver && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700">Over budget</span>
          )}
        </div>
        <div className="mt-1 text-xl font-bold">
          {rupee(extraSpent)}{' '}
          <span className="text-base font-medium text-slate-400">/ {rupee(extraBudget)}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full ${extraOver ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${percentOf(extraSpent, extraBudget)}%` }}
          />
        </div>
        <div className={`mt-2 text-sm font-medium ${extraOver ? 'text-red-700' : 'text-amber-700'}`}>
          {extraOver
            ? `${rupee(extraSpent - extraBudget)} over, taken from your regular budget`
            : `${rupee(extraBudget - extraSpent)} left for big expenses`}
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