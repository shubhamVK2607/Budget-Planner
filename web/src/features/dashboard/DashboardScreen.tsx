import { useState } from 'react'
import { ChevronRight, Plus, TrendingUp } from 'lucide-react'
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
  getTotalFixed,
} from '../budget/budget'
import type { Status } from '../budget/budget'
import { forDate, forMonth, ofKind, sumAmount } from '../expenses/expenses'
import ExpenseRow from '../expenses/ExpenseRow'

type Props = {
  budget: MonthBudget
  categories: Category[]
  expenses: Expense[]
  onAddClick: () => void
  onExpenseClick: (expense: Expense) => void
  onTrendClick: () => void
}

const statusStyle: Record<Status, { card: string; bar: string; text: string }> = {
  green: { card: 'border-emerald-200 bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  yellow: { card: 'border-amber-200 bg-amber-50', bar: 'bg-amber-400', text: 'text-amber-700' },
  red: { card: 'border-red-200 bg-red-50', bar: 'bg-red-500', text: 'text-red-700' },
}

const regularLabel: Record<Status, string> = {
  green: 'On track',
  yellow: 'Close to limit',
  red: 'Over limit',
}

const extraLabel: Record<Status, string> = {
  green: 'On track',
  yellow: 'Close to budget',
  red: 'Over budget',
}

const percentOf = (spent: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : spent > 0 ? 100 : 0

export default function DashboardScreen({
  budget,
  categories,
  expenses,
  onAddClick,
  onExpenseClick,
  onTrendClick,
}: Props) {
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

  // Today (sirf Regular)
  const todaySpent = sumAmount(ofKind(todayExpenses, 'regular'))
  const baseLimit = getDailyLimit(budget)
  const todayLimit = isCurrentMonth ? getDailyLimitOn(budget, expenses, today) : baseLimit
  const todayStatus = getStatus(todaySpent, todayLimit)

  // Month: Regular
  const regularSpent = sumAmount(ofKind(monthExpenses, 'regular'))
  const overflow = getOverflow(budget, expenses)
  const regularBudget = Math.max(0, getRegularBudget(budget) - overflow)
  const regularMonthStatus = getStatus(regularSpent, regularBudget)
  const regularCardStatus = isCurrentMonth ? todayStatus : regularMonthStatus

  // Month: Extra
  const extraSpent = sumAmount(ofKind(monthExpenses, 'extra'))
  const extraBudget = getExtraBudget(budget)
  const extraStatus = getStatus(extraSpent, extraBudget)
  const extraOver = extraSpent > extraBudget

  // Month summary (Fixed + Regular + Extra)
  const fixedTotal = getTotalFixed(budget)
  const totalSpent = fixedTotal + regularSpent + extraSpent
  const scale = Math.max(budget.income, totalSpent, 1)
  const remaining = budget.income - totalSpent

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Unknown'

  const rs = statusStyle[regularCardStatus]
  const es = statusStyle[extraStatus]

  return (
    <div className="space-y-4 p-5">
      {/* This month: chhota summary */}
      <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-slate-500">THIS MONTH</span>
          <span>
            <b>{rupee(totalSpent)}</b>
            <span className="text-slate-400"> of {rupee(budget.income)}</span>
          </span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="bg-slate-400" style={{ width: `${(fixedTotal / scale) * 100}%` }} />
          <div className="bg-indigo-500" style={{ width: `${(regularSpent / scale) * 100}%` }} />
          <div className="bg-amber-500" style={{ width: `${(extraSpent / scale) * 100}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Fixed {rupee(fixedTotal)}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Regular {rupee(regularSpent)}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Extra {rupee(extraSpent)}
          </span>
        </div>
        <div className={`mt-1 text-xs font-medium ${remaining >= 0 ? 'text-slate-500' : 'text-red-600'}`}>
          {remaining >= 0 ? `${rupee(remaining)} left of income` : `${rupee(-remaining)} over income`}
        </div>
      </div>

      {/* REGULAR card */}
      <div className={`rounded-2xl border p-5 ${rs.card}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide text-slate-700">REGULAR</span>
          <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${rs.text}`}>
            {regularLabel[regularCardStatus]}
          </span>
        </div>

        {isCurrentMonth && (
          <div className="mt-3">
            <div className="text-xs font-medium text-slate-500">TODAY</div>
            <div className="mt-1 text-3xl font-bold">
              {rupee(todaySpent)}{' '}
              <span className="text-lg font-medium text-slate-400">/ {rupee(todayLimit)}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full ${statusStyle[todayStatus].bar}`}
                style={{ width: `${percentOf(todaySpent, todayLimit)}%` }}
              />
            </div>
            <div className={`mt-2 text-sm font-medium ${rs.text}`}>
              {todaySpent <= todayLimit
                ? `${rupee(todayLimit - todaySpent)} left today`
                : `${rupee(todaySpent - todayLimit)} over today's limit`}
            </div>
            {todayLimit < baseLimit && (
              <div className="mt-1 text-xs text-slate-500">
                Reduced from {rupee(baseLimit)} because extra spending went over budget.
              </div>
            )}
          </div>
        )}

        <button
          onClick={onTrendClick}
          className="mt-3 flex w-full items-center justify-between border-t border-black/5 pt-3 text-sm font-semibold text-slate-700"
        >
          <span className="flex items-center gap-2">
            <TrendingUp size={16} /> Daily spending trend
          </span>
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      </div>

      {/* EXTRA card */}
      <div className={`rounded-2xl border p-5 ${es.card}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide text-slate-700">EXTRA</span>
          <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${es.text}`}>
            {extraLabel[extraStatus]}
          </span>
        </div>
        <div className="mt-2 text-3xl font-bold">
          {rupee(extraSpent)}{' '}
          <span className="text-lg font-medium text-slate-400">/ {rupee(extraBudget)}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full ${es.bar}`}
            style={{ width: `${percentOf(extraSpent, extraBudget)}%` }}
          />
        </div>
        <div className={`mt-2 text-sm font-medium ${es.text}`}>
          {extraOver
            ? `${rupee(extraSpent - extraBudget)} over, taken from your regular budget`
            : `${rupee(extraBudget - extraSpent)} left in extra budget`}
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
        <div className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex w-full max-w-[480px] -translate-x-1/2 justify-end px-5">
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