import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Expense, MonthBudget } from '../../shared/types'
import { formatMonth, shiftMonth } from '../../shared/utils/date'
import { getDailyLimitOn, getDaysInMonth, getStatus } from '../budget/budget'
import { forDate, forMonth, ofKind, sumAmount } from '../expenses/expenses'

type Props = {
  budgets: Record<string, MonthBudget>
  expenses: Expense[]
  selectedDate: string
  minDate: string
  today: string
  onSelect: (date: string) => void
  onClose: () => void
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const cellStyle = {
  green: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  neutral: 'bg-slate-100 text-slate-600',
  disabled: 'bg-slate-50 text-slate-300',
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n))

export default function CalendarPopup({ budgets, expenses, selectedDate, minDate, today, onSelect, onClose }: Props) {
  const [browse, setBrowse] = useState(selectedDate.slice(0, 7))

  const budget = budgets[browse]
  const [year, m] = browse.split('-').map(Number)
  const daysInMonth = getDaysInMonth(browse)
  const startOffset = new Date(year, m - 1, 1).getDay() // 0 = Sunday
  const monthExpenses = forMonth(expenses, browse)
  const canPrev = browse > minDate.slice(0, 7)
  const canNext = browse < today.slice(0, 7)

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[480px] rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous month"
              disabled={!canPrev}
              onClick={() => setBrowse(shiftMonth(browse, -1))}
              className="rounded-full p-1.5 disabled:opacity-20"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="min-w-[140px] text-center text-lg font-bold">{formatMonth(browse)}</h2>
            <button
              aria-label="Next month"
              disabled={!canNext}
              onClick={() => setBrowse(shiftMonth(browse, 1))}
              className="rounded-full p-1.5 disabled:opacity-20"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button aria-label="Close" onClick={onClose} className="rounded-full p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
          {WEEKDAYS.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />
            const date = `${browse}-${String(day).padStart(2, '0')}`
            const disabled = date > today || date < minDate
            const dayList = forDate(monthExpenses, date)
            const regular = sumAmount(ofKind(dayList, 'regular'))
            const hasExtra = ofKind(dayList, 'extra').length > 0

            let style = cellStyle.disabled
            if (!disabled) {
              style = budget
                ? cellStyle[getStatus(regular, getDailyLimitOn(budget, expenses, date))]
                : cellStyle.neutral
            }

            return (
              <button
                key={date}
                disabled={disabled}
                onClick={() => onSelect(date)}
                className={`relative flex h-11 flex-col items-center justify-center rounded-xl text-sm font-semibold ${style} ${
                  selectedDate === date ? 'ring-2 ring-indigo-600' : ''
                } ${date === today ? 'underline underline-offset-2' : ''}`}
              >
                {day}
                <span className="text-[10px] font-medium leading-none">
                  {!disabled && regular > 0 ? compact(regular) : ''}
                </span>
                {hasExtra && !disabled && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-300" /> Within limit
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" /> Close
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-300" /> Over
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Extra
          </span>
        </div>

        {selectedDate !== today && (
          <button
            onClick={() => onSelect(today)}
            className="mt-3 w-full rounded-xl border border-indigo-600 py-2 font-semibold text-indigo-600"
          >
            Go to today
          </button>
        )}
      </div>
    </div>
  )
}