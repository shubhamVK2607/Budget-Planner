import type { Expense } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatShortDate } from '../../shared/utils/date'

type Props = {
  expense: Expense
  categoryName: string
  showDate?: boolean
  onClick: () => void
}

export default function ExpenseRow({ expense, categoryName, showDate = false, onClick }: Props) {
  const sub = [showDate ? formatShortDate(expense.date) : null, expense.note ? categoryName : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <button onClick={onClick} className="flex w-full items-center justify-between px-4 py-3 text-left">
      <div>
        <div>{expense.note || categoryName}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
      <b>{rupee(expense.amount)}</b>
    </button>
  )
}