import { useState } from 'react'
import { ChevronRight, TrendingUp } from 'lucide-react'
import type { Category, Expense, Kind } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatMonth } from '../../shared/utils/date'
import { kindOf } from '../../shared/utils/kind'
import { useI18n } from '../../shared/i18n/context'
import ListDialog from '../../shared/components/ListDialog'
import ExpenseRow from '../expenses/ExpenseRow'
import { getCategoryInsights } from './insights'
import type { CategorySlice } from './insights'

type Props = {
  categories: Category[]
  expenses: Expense[]
  month: string
  today: string
  onExpenseClick: (expense: Expense) => void
  onTrendClick: () => void
}

function Donut({
  slices,
  total,
  centerLabel,
  onSelect,
}: {
  slices: CategorySlice[]
  total: number
  centerLabel: string
  onSelect: (id: string) => void
}) {
  const r = 44
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-48 w-48">
      <circle cx={60} cy={60} r={r} fill="none" strokeWidth={16} className="stroke-slate-100" />
      {slices.map((s) => {
        const len = s.share * circumference
        const circle = (
          <circle
            key={s.id}
            cx={60}
            cy={60}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={16}
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 60 60)"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(s.id)}
          />
        )
        offset += len
        return circle
      })}
      <text x={60} y={56} textAnchor="middle" fontSize={7} className="fill-slate-500">
        {centerLabel}
      </text>
      <text x={60} y={69} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-slate-900">
        {rupee(total)}
      </text>
    </svg>
  )
}

function Change({ slice }: { slice: CategorySlice }) {
  const { t } = useI18n()
  if (slice.isNew) return <span className="text-xs text-slate-400">{t.common.new}</span>
  if (slice.change === null) return null
  if (slice.change === 0) return <span className="text-xs text-slate-400">{t.common.noChange}</span>
  const up = slice.change > 0
  return (
    <span className={`text-xs font-medium ${up ? 'text-red-600' : 'text-emerald-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(slice.change)}%
    </span>
  )
}

export default function InsightsScreen({ categories, expenses, month, today, onExpenseClick, onTrendClick }: Props) {
  const { t, locale, catName } = useI18n()
  const [kind, setKind] = useState<Kind>('regular')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { total, slices, hasPrev } = getCategoryInsights(expenses, categories, kind, month, today)
  const selected = slices.find((s) => s.id === selectedId)
  const selectedList = selected
    ? expenses
        .filter((e) => kindOf(e) === kind && e.categoryId === selected.id && e.date.startsWith(month))
        .sort((a, b) => b.date.localeCompare(a.date))
    : []

  const labelOf = (s: CategorySlice) => {
    const category = categories.find((c) => c.id === s.id)
    return category ? catName(category) : s.name
  }
  const monthLabel = formatMonth(month, locale)

  return (
    <div className="space-y-4 p-5">
      <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        {(['regular', 'extra'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`flex-1 rounded-lg py-2 ${kind === k ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          >
            {k === 'regular' ? t.common.regular : t.common.extra}
          </button>
        ))}
      </div>

      {slices.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-5 text-center text-slate-400">{t.insights.empty(kind, monthLabel)}</p>
      ) : (
        <>
          <Donut slices={slices} total={total} centerLabel={t.insights.centerLabel} onSelect={setSelectedId} />

          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">{t.insights.byCategory}</div>
            <div className="max-h-[19rem] divide-y divide-slate-100 overflow-y-auto overscroll-contain rounded-2xl border border-slate-100">
              {slices.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1">
                    <span className="block">{labelOf(s)}</span>
                    <span className="block text-xs text-slate-400">
                      {t.insights.share(Math.round(s.share * 100), kind)}
                    </span>
                  </span>
                  <span className="text-right">
                    <b className="block">{rupee(s.total)}</b>
                    <Change slice={s} />
                  </span>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              ))}
            </div>
            {hasPrev && <p className="mt-2 text-xs text-slate-400">{t.insights.changeNote}</p>}
          </div>
        </>
      )}

      <button
        onClick={onTrendClick}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-3">
          <TrendingUp size={18} className="text-slate-500" />
          <span>
            <span className="block font-semibold">{t.insights.trendTitle}</span>
            <span className="block text-xs text-slate-400">{t.insights.trendSub}</span>
          </span>
        </span>
        <ChevronRight size={18} className="text-slate-300" />
      </button>

      {selected && (
        <ListDialog
          title={`${labelOf(selected)} · ${monthLabel}`}
          subtitle={kind === 'regular' ? t.common.regular : t.common.extra}
          total={selected.total}
          footerNote={t.insights.dialogFooter(Math.round(selected.share * 100), kind)}
          onClose={() => setSelectedId(null)}
        >
          <div className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {selectedList.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                categoryName={labelOf(selected)}
                showDate
                onClick={() => onExpenseClick(e)}
              />
            ))}
          </div>
        </ListDialog>
      )}
    </div>
  )
}