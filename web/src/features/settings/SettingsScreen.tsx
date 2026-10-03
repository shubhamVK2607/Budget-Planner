import type { Category, Kind, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatMonth } from '../../shared/utils/date'
import { getDailyLimit, getExtraBudget, getTotalFixed } from '../budget/budget'
import CategoryManager from './CategoryManager'

type Props = {
  budget: MonthBudget
  categories: Category[]
  onEditBudget: () => void
  onAddCategory: (name: string, kind: Kind) => void
  onToggleArchive: (id: string) => void
}

export default function SettingsScreen({
  budget,
  categories,
  onEditBudget,
  onAddCategory,
  onToggleArchive,
}: Props) {
  return (
    <div className="p-5">
      <h1 className="mb-4 text-xl font-bold">Settings</h1>

      <div className="mb-2 text-sm font-medium text-slate-500">
        BUDGET · {formatMonth(budget.month).toUpperCase()}
      </div>
      <div className="mb-6 rounded-2xl border border-slate-100 p-4">
        <div className="flex justify-between"><span>Income</span><b>{rupee(budget.income)}</b></div>
        <div className="flex justify-between"><span>Fixed expenses</span><b>{rupee(getTotalFixed(budget))}</b></div>
        <div className="flex justify-between"><span>Extra expenses budget</span><b>{rupee(getExtraBudget(budget))}</b></div>
        <div className="flex justify-between"><span>Daily limit</span><b>{rupee(getDailyLimit(budget))}</b></div>
        <button
          onClick={onEditBudget}
          className="mt-3 cursor-pointer w-full rounded-xl border border-indigo-600 py-2 font-semibold text-indigo-600"
        >
          Edit budget
        </button>
      </div>

      <CategoryManager
        title="REGULAR CATEGORIES (daily spending)"
        kind="regular"
        categories={categories}
        onAdd={onAddCategory}
        onToggleArchive={onToggleArchive}
      />
      <CategoryManager
        title="EXTRA CATEGORIES (big / one-time)"
        kind="extra"
        categories={categories}
        onAdd={onAddCategory}
        onToggleArchive={onToggleArchive}
      />
    </div>
  )
}