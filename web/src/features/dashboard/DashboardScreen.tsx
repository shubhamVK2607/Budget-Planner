import type { Category, Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { getToday } from '../../shared/utils/date'
import { getDailyLimit, getPool, getStatus } from '../budget/budget'
import { forDate, forMonth, sumAmount, totalsByCategory } from '../expenses/expenses'

type Props = {
  budget: MonthBudget
  categories: Category[]
  expenses: Expense[]
  onAddClick: () => void
   onExpenseClick: (expense: Expense) => void
onSettingsClick: () => void
}

const statusColor = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
}

export default function DashboardScreen({ budget, categories, expenses, onAddClick, onExpenseClick,onSettingsClick }: Props) {
  const [year, m] = budget.month.split('-').map(Number)
  const monthName = new Date(year, m - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const monthExpenses = forMonth(expenses, budget.month)
  const todayExpenses = forDate(expenses, getToday())

  const pool = getPool(budget)
  const dailyLimit = getDailyLimit(budget)
  const todaySpent = sumAmount(todayExpenses)
  const monthSpent = sumAmount(monthExpenses)
  const status = getStatus(todaySpent, dailyLimit)
  const catTotals = totalsByCategory(monthExpenses)
  const monthPercent = pool > 0 ? Math.min(100, Math.round((monthSpent / pool) * 100)) : 0
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Unknown'

  return (
    <div className="flex min-h-screen flex-col">
      <div className="space-y-4 p-5">
       <div className="flex items-center justify-between">
  <h1 className="text-xl font-bold">{monthName}</h1>
  <button className="text-2xl" onClick={onSettingsClick}>⚙️</button>
</div>

        {/* Today's status */}
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">TODAY</span>
            <span className={`h-3 w-3 rounded-full ${statusColor[status]}`} />
          </div>
          <div className="mt-1 text-3xl font-bold">
            {rupee(todaySpent)}{' '}
            <span className="text-lg font-medium text-slate-400">/ {rupee(dailyLimit)}</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {todaySpent <= dailyLimit
              ? `${rupee(dailyLimit - todaySpent)} left`
              : `${rupee(todaySpent - dailyLimit)} over`}
          </div>
        </div>

        {/* Monthly progress */}
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

        {/* Categories */}
        <div>
          <div className="mb-2 text-sm font-medium text-slate-500">CATEGORIES</div>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {categories
  .filter((c) => !c.archived || (catTotals[c.id] ?? 0) > 0)
  .map((c) => (
              <div key={c.id} className="flex justify-between px-4 py-3">
                <span>{c.name}</span>
                <b>{rupee(catTotals[c.id] ?? 0)}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Today's spending */}
        <div>
          <div className="mb-2 text-sm font-medium text-slate-500">TODAY'S SPENDING</div>
          {todayExpenses.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-slate-400">No spending yet today</p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
             {[...todayExpenses].reverse().map((e) => (
  <button
    key={e.id}
    onClick={() => onExpenseClick(e)}
    className="flex w-full justify-between px-4 py-3 text-left"
  >
    <div>
      <div>{e.note || catName(e.categoryId)}</div>
      {e.note && <div className="text-xs text-slate-400">{catName(e.categoryId)}</div>}
    </div>
    <b>{rupee(e.amount)}</b>
  </button>
))}
            </div>
          )}
        </div>
      </div>

      {/* Floating + button */}
      <div className="pointer-events-none sticky bottom-6 mt-auto flex justify-end px-5 pb-2">
        <button
          onClick={onAddClick}
          className="pointer-events-auto h-14 w-14 rounded-full bg-indigo-600 text-3xl text-white shadow-lg"
        >
          +
        </button>
      </div>
    </div>
  )
}