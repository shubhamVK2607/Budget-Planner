import type { MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatMonth } from '../../shared/utils/date'
import { useI18n } from '../../shared/i18n/context'
import { getTotalFixed } from '../budget/budget'

type Props = {
  month: string
  previous: MonthBudget
  onCopy: () => void
  onFresh: () => void
}

export default function NewMonthScreen({ month, previous, onCopy, onFresh }: Props) {
  const { t, locale } = useI18n()

  return (
    <div className="p-5">
      <h2 className="mt-8 text-2xl font-bold">{t.month.noBudget(formatMonth(month, locale))}</h2>
      <p className="mb-6 mt-1 text-slate-500">{t.month.setup}</p>

      <div className="rounded-2xl bg-indigo-50 p-4">
        <div className="mb-2 font-semibold">{t.month.copyFrom(formatMonth(previous.month, locale))}</div>
        <div className="flex justify-between text-sm">
          <span>{t.common.income}</span>
          <b>{rupee(previous.income)}</b>
        </div>
        <div className="flex justify-between text-sm">
          <span>{t.common.fixedExpenses}</span>
          <b>{rupee(getTotalFixed(previous))}</b>
        </div>
        <button onClick={onCopy} className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">
          {t.month.copyBudget}
        </button>
      </div>

      <button onClick={onFresh} className="mt-3 w-full rounded-xl border border-slate-300 py-3 font-semibold">
        {t.month.startFresh}
      </button>
    </div>
  )
}