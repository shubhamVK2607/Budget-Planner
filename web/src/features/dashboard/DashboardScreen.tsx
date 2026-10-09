import { useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import type { Category, Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatShortDate, getToday } from '../../shared/utils/date'
import { useI18n } from '../../shared/i18n/context'
import { getDailyLimit, getDailyLimitOn, getExtraBudget, getStatus, getTotalFixed } from '../budget/budget'
import type { Status } from '../budget/budget'
import { forDate, forMonth, ofKind, sumAmount } from '../expenses/expenses'
import { ExtraDialog, MonthDialog, RegularDialog } from './SpendingDialogs'

type Props = {
  budget: MonthBudget
  categories: Category[]
  expenses: Expense[]
  viewDate: string
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
  onAddClick,
  onExpenseClick,
}: Props) {
  const { t, locale } = useI18n()
  const [dialog, setDialog] = useState<'month' | 'regular' | 'extra' | null>(null)
  const isToday = viewDate === getToday()

  const monthExpenses = forMonth(expenses, budget.month)
  const regularMonth = ofKind(monthExpenses, 'regular')
  const extraMonth = ofKind(monthExpenses, 'extra')
  const dayRegular = ofKind(forDate(expenses, viewDate), 'regular')

  // Regular card: chuna hua din
  const daySpent = sumAmount(dayRegular)
  const baseLimit = getDailyLimit(budget)
  const dayLimit = getDailyLimitOn(budget, expenses, viewDate)
  const dayStatus = getStatus(daySpent, dayLimit)
  const rs = statusStyle[dayStatus]
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
  const scale = Math.max(budget.income, totalSpent, 1)
  const remaining = budget.income - totalSpent

  return (
    <>
      <div className="space-y-4 p-5">
        {/* THIS MONTH */}
        <button
          onClick={() => setDialog('month')}
          className="block w-full rounded-2xl bg-slate-50 px-5 py-5 text-left"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-500">{t.home.thisMonth}</span>
            <span className="text-lg">
              <b>{rupee(totalSpent)}</b>
              <span className="text-sm text-slate-400"> / {rupee(budget.income)}</span>
            </span>
          </div>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="bg-slate-400" style={{ width: `${(fixedTotal / scale) * 100}%` }} />
            <div className="bg-indigo-500" style={{ width: `${(regularSpent / scale) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(extraSpent / scale) * 100}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs text-slate-500">
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
              {remaining >= 0 ? t.home.leftOfIncome(rupee(remaining)) : t.home.overIncome(rupee(-remaining))}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-slate-400">
              {t.home.seeAll} <ChevronRight size={14} />
            </span>
          </div>
        </button>

        {/* REGULAR */}
        <button
          onClick={() => setDialog('regular')}
          className={`block w-full rounded-2xl border p-5 text-left ${rs.card}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wide text-slate-700">{t.home.regularTitle}</span>
            <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${rs.text}`}>
              {t.status.regular[dayStatus]}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-xs font-medium text-slate-500">{dayLabel}</div>
            <div className="mt-1 text-3xl font-bold">
              {rupee(daySpent)}{' '}
              <span className="text-lg font-medium text-slate-400">/ {rupee(dayLimit)}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full ${rs.bar}`}
                style={{ width: `${percentOf(daySpent, dayLimit)}%` }}
              />
            </div>
            <div className={`mt-2 text-sm font-medium ${rs.text}`}>
              {daySpent <= dayLimit
                ? t.home.leftOn(rupee(dayLimit - daySpent), isToday)
                : t.home.overOn(rupee(daySpent - dayLimit), isToday)}
            </div>
            {dayLimit < baseLimit && (
              <div className="mt-1 text-xs text-slate-500">{t.home.reduced(rupee(baseLimit))}</div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-0.5 text-xs text-slate-500">
            {t.home.seeExpenses(isToday)} <ChevronRight size={14} />
          </div>
        </button>

        {/* EXTRA */}
        <button
          onClick={() => setDialog('extra')}
          className={`block w-full rounded-2xl border p-5 text-left ${es.card}`}
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
  )
}