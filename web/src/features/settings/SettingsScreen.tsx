import type { Category, Kind, MonthBudget } from '../../shared/types'
import type { AppData } from '../../services/storage'
import type { Language, Theme } from '../../services/settings'
import { rupee } from '../../shared/utils/format'
import { formatMonth } from '../../shared/utils/date'
import { useI18n, useSettings } from '../../shared/i18n/context'
import { getDailyLimit, getExtraBudget, getTotalFixed } from '../budget/budget'
import CategoryManager from './CategoryManager'
import BackupSection from './BackupSection'

type Props = {
  budget: MonthBudget
  categories: Category[]
  data: AppData
  onEditBudget: () => void
  onAddCategory: (name: string, kind: Kind) => void
  onRenameCategory: (id: string, name: string) => void
  onMergeCategory: (fromId: string, toId: string) => void
  onToggleArchive: (id: string) => void
  onImport: (data: AppData) => void
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1 ${value === o.value ? 'bg-white shadow-sm' : 'text-slate-500'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function SettingsScreen({
  budget,
  categories,
  data,
  onEditBudget,
  onAddCategory,
  onRenameCategory,
  onMergeCategory,
  onToggleArchive,
  onImport,
}: Props) {
  const { t, locale } = useI18n()
  const { settings, update } = useSettings()

  return (
    <div className="p-5">
      <h1 className="mb-4 text-xl font-bold">{t.settings.title}</h1>

      <div className="mb-2 text-sm font-medium text-slate-500">
        {t.settings.budgetFor(formatMonth(budget.month, locale))}
      </div>
      <div className="mb-6 rounded-2xl border border-slate-100 p-4">
        <div className="flex justify-between"><span>{t.common.income}</span><b>{rupee(budget.income)}</b></div>
        <div className="flex justify-between"><span>{t.common.fixedExpenses}</span><b>{rupee(getTotalFixed(budget))}</b></div>
        <div className="flex justify-between"><span>{t.settings.extraBudget}</span><b>{rupee(getExtraBudget(budget))}</b></div>
        <div className="flex justify-between"><span>{t.common.dailyLimit}</span><b>{rupee(getDailyLimit(budget))}</b></div>
        <button
          onClick={onEditBudget}
          className="mt-3 w-full rounded-xl border border-indigo-600 py-2 font-semibold text-indigo-600"
        >
          {t.settings.editBudget}
        </button>
      </div>

      <div className="mb-2 text-sm font-medium text-slate-500">{t.settings.preferences}</div>
      <div className="mb-6 space-y-3 rounded-2xl border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <span>{t.settings.theme}</span>
          <Segmented<Theme>
            value={settings.theme}
            onChange={(theme) => update({ theme })}
            options={[
              { value: 'light', label: t.settings.light },
              { value: 'dark', label: t.settings.dark },
            ]}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>{t.settings.language}</span>
          <Segmented<Language>
            value={settings.language}
            onChange={(language) => update({ language })}
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिन्दी' },
            ]}
          />
        </div>
      </div>

      <BackupSection data={data} onImport={onImport} />

      <CategoryManager
        title={t.settings.regularCats}
        kind="regular"
        categories={categories}
        expenses={data.expenses}
        onAdd={onAddCategory}
        onRename={onRenameCategory}
        onMerge={onMergeCategory}
        onToggleArchive={onToggleArchive}
      />
      <CategoryManager
        title={t.settings.extraCats}
        kind="extra"
        categories={categories}
        expenses={data.expenses}
        onAdd={onAddCategory}
        onRename={onRenameCategory}
        onMerge={onMergeCategory}
        onToggleArchive={onToggleArchive}
      />
    </div>
  )
}