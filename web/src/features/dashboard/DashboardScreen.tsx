import { useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import type { Category, Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatShortDate, getToday } from '../../shared/utils/date'
import { useI18n } from '../../shared/i18n/context'
import {
  getDailyLimit,
  getDailyLimitOn,
  getExtraBudget,
  getSavings,
  getSpendable,
  getStatus,
  getTotalFixed,
  isRegularBudgetFinishedOn,
} from '../budget/budget'
import type { Status } from '../budget/budget'
import { forDate, forMonth, ofKind, sumAmount } from '../expenses/expenses'
import { ExtraDialog, MonthDialog, RegularDialog } from './SpendingDialogs'

type Props = {
  budget: MonthBudget
  categories: Category[]
  expenses: Expense[]
  viewDate: string
  isPlanning: boolean
  onAddClick: () => void
  onExpenseClick: (expense: Expense) => void
}

const statusStyle: Record<Status, { card: string; bar: string; text: string }> = {
  green: { card: 'border-emerald-200 bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  yellow: { card: 'border-amber-200 bg-amber-50', bar: 'bg-amber-400', text: 'text-amber-700' },
  red: { card: 'border-red-200 bg-red-50', bar: 'bg-red-500', text: 'text-red-700' },
}

const percentOf = (spent: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : spent > 0 ? 100 : 0

export default function DashboardScreen({
  budget,
  categories,
  expenses,
  viewDate,
  isPlanning,
  onAddClick,
  onExpenseClick,
}: Props) {
  const { t, locale } = useI18n()
  const [dialog, setDialog] = useState<'month' | 'regular' | 'extra' | null>(null)
  const [showSavings, setShowSavings] = useState(false)
  const isToday = viewDate === getToday()

  const monthExpenses = forMonth(expenses, budget.month)
  const regularMonth = ofKind(monthExpenses, 'regular')
  const extraMonth = ofKind(monthExpenses, 'extra')
  const dayExpenses = forDate(expenses, viewDate)
  const dayRegular = ofKind(dayExpenses, 'regular')
  const dayExtraSpent = sumAmount(ofKind(dayExpenses, 'extra'))

  // Regular card: chuna hua din
  const daySpent = sumAmount(dayRegular)
  const dayLimit = getDailyLimitOn(budget, expenses, viewDate)
  const dayStatus = getStatus(daySpent, dayLimit)
  const rs = statusStyle[dayStatus]
  const regularFinished = isRegularBudgetFinishedOn(budget, expenses, viewDate)
  const dayLabel = isToday ? t.home.today : formatShortDate(viewDate, locale).toUpperCase()

  // Extra card: poora mahina
  const extraSpent = sumAmount(extraMonth)
  const extraBudget = getExtraBudget(budget)
  const extraStatus = getStatus(extraSpent, extraBudget)
  const extraOver = extraSpent > extraBudget
  const es = statusStyle[extraStatus]

  // This month strip (Fixed + Regular + Extra)
  const regularSpent = sumAmount(regularMonth)
  const fixedTotal = getTotalFixed(budget)
  const totalSpent = fixedTotal + regularSpent + extraSpent
  const spendable = getSpendable(budget)
  const scale = Math.max(spendable, totalSpent, 1)
  const remaining = spendable - totalSpent
  const savings = getSavings(budget, expenses)
  const savingsTarget = budget.savingsTarget ?? 0
  const savingsReduced = Math.min(savingsTarget, Math.max(0, savingsTarget - savings))
  const usingSavings = savings < savingsTarget
  const shownSavings = Math.max(0, savings)
  const savingsIndicator = (
    <div className="flex justify-end">
      <button
        type="button"
        aria-label={t.common.savings}
        aria-expanded={showSavings}
        onClick={() => setShowSavings(!showSavings)}
        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
          usingSavings ? 'bg-red-100 text-red-800 ring-1 ring-red-200' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
        }`}
      >
        {showSavings
          ? usingSavings && savingsReduced > 0
            ? t.home.savingsReduced(rupee(shownSavings), rupee(savingsReduced))
            : t.home.savingsAmount(rupee(shownSavings))
          : usingSavings
            ? t.home.usingSavings
            : t.common.savings}
      </button>
    </div>
  )

  return (
    <>
      {isPlanning ? (
        <div className="space-y-3 p-4 pb-6">
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <h2 className="mb-4 text-sm font-bold tracking-wide text-indigo-900">{t.home.planTitle}</h2>
            <div className="space-y-3">
              {[
                [t.common.income, budget.income],
                [t.common.fixed, getTotalFixed(budget)],
                [t.common.spendable, getSpendable(budget)],
                [t.common.savings, budget.savingsTarget ?? 0],
                [t.home.expectedDailyLimit, getDailyLimit(budget)],
                [t.home.planExtraBudget, getExtraBudget(budget)],
              ].map(([label, amount]) => (
                <div key={label} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-600">{String(label)}</span>
                  <b>{rupee(Number(amount))}</b>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
      <div className="space-y-3 p-4 pb-6">
        {/* THIS MONTH */}
        <button
          onClick={() => setDialog('month')}
          className="block w-full rounded-2xl bg-slate-50 p-4 text-left"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-500">{t.home.thisMonth}</span>
            <span className="text-lg">
              <b>{rupee(totalSpent)}</b>
              <span className="text-sm text-slate-400"> / {rupee(spendable)}</span>
            </span>
          </div>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="bg-slate-400" style={{ width: `${(fixedTotal / scale) * 100}%` }} />
            <div className="bg-indigo-500" style={{ width: `${(regularSpent / scale) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(extraSpent / scale) * 100}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> {t.common.fixed} {rupee(fixedTotal)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> {t.common.regular} {rupee(regularSpent)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> {t.common.extra} {rupee(extraSpent)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
            <span className={`font-medium ${remaining >= 0 ? 'text-slate-600' : 'text-red-600'}`}>
              {remaining >= 0
                ? t.home.leftOfSpendable(rupee(remaining))
                : t.home.overSpendable(rupee(-remaining))}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-slate-400">
              {t.home.seeAll} <ChevronRight size={14} />
            </span>
          </div>
        </button>

        {savingsIndicator}

        {/* REGULAR */}
        <button
          onClick={() => setDialog('regular')}
          className={`block w-full rounded-2xl border p-4 text-left ${rs.card}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wide text-slate-700">{t.home.regularTitle}</span>
            <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${rs.text}`}>
              {t.status.regular[dayStatus]}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex min-h-6 items-center justify-between gap-2 text-xs font-bold text-slate-500">
              <span>{dayLabel}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <div className="min-w-0 whitespace-nowrap text-3xl font-bold">
                {rupee(daySpent)}{' '}
                <span className="text-lg font-medium text-slate-400">/ {rupee(dayLimit)}</span>
              </div>
              <span className="shrink-0 text-md font-semibold tabular-nums text-slate-700">
                {t.home.extraOnDay(rupee(dayExtraSpent))}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full ${rs.bar}`}
                style={{ width: `${percentOf(daySpent, dayLimit)}%` }}
              />
            </div>
            <div className={`mt-2 text-sm font-medium ${rs.text}`}>
              {regularFinished
                ? t.home.regularFinished
                : daySpent <= dayLimit
                ? t.home.leftOn(rupee(dayLimit - daySpent), isToday)
                : t.home.overOn(rupee(daySpent - dayLimit), isToday)}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-0.5 text-xs text-slate-500">
            {t.home.seeExpenses(isToday)} <ChevronRight size={14} />
          </div>
        </button>

        {/* EXTRA */}
        <button
          onClick={() => setDialog('extra')}
          className={`block w-full rounded-2xl border p-4 text-left ${es.card}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wide text-slate-700">{t.home.extraTitle}</span>
            <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${es.text}`}>
              {t.status.extra[extraStatus]}
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
              ? t.home.extraOver(rupee(extraSpent - extraBudget))
              : t.home.extraLeft(rupee(extraBudget - extraSpent))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-0.5 text-xs text-slate-500">
            {t.home.seeExtra} <ChevronRight size={14} />
          </div>
        </button>
      </div>

      {/* Floating + (chune hue din ka kharcha add karta hai) */}
      <div className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex w-full max-w-[480px] -translate-x-1/2 justify-end px-5">
        <button
          aria-label={t.home.addExpense}
          onClick={onAddClick}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg"
        >
          <Plus size={28} />
        </button>
      </div>

      {dialog === 'month' && (
        <MonthDialog
          budget={budget}
          categories={categories}
          monthExpenses={monthExpenses}
          onExpenseClick={onExpenseClick}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'regular' && (
        <RegularDialog
          dateLabel={isToday ? t.common.today : formatShortDate(viewDate, locale)}
          limit={dayLimit}
          expenses={dayRegular}
          categories={categories}
          onExpenseClick={onExpenseClick}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'extra' && (
        <ExtraDialog
          budget={budget}
          expenses={extraMonth}
          categories={categories}
          onExpenseClick={onExpenseClick}
          onClose={() => setDialog(null)}
        />
      )}
        </>
      )}
    </>
  )
}