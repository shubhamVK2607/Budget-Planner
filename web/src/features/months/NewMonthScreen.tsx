import type { MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatMonth } from '../../shared/utils/date'
import { getTotalFixed } from '../budget/budget'

type Props = {
  month: string
  previous: MonthBudget
  onCopy: () => void
  onFresh: () => void
}

export default function NewMonthScreen({ month, previous, onCopy, onFresh }: Props) {
  return (
    <div className="p-5">
      <h2 className="mt-8 text-2xl font-bold">No budget for {formatMonth(month)}</h2>
      <p className="mb-6 mt-1 text-slate-500">Set it up in one tap, or start from scratch.</p>

      <div className="rounded-2xl bg-indigo-50 p-4">
        <div className="mb-2 font-semibold">Copy from {formatMonth(previous.month)}</div>
        <div className="flex justify-between text-sm">
          <span>Income</span>
          <b>{rupee(previous.income)}</b>
        </div>
        <div className="flex justify-between text-sm">
          <span>Fixed expenses</span>
          <b>{rupee(getTotalFixed(previous))}</b>
        </div>
        <button onClick={onCopy} className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">
          Copy budget
        </button>
      </div>

      <button onClick={onFresh} className="mt-3 w-full rounded-xl border border-slate-300 py-3 font-semibold">
        Start fresh
      </button>
    </div>
  )
}