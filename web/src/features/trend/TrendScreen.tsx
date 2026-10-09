import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { formatShortDate, getToday } from '../../shared/utils/date'
import { useI18n } from '../../shared/i18n/context'
import { getDailySeries, getPaceInfo, getTrendSummary } from './trend'

type Props = {
  budget: MonthBudget
  expenses: Expense[]
  onBack: () => void
}

const BAR_COLOR = { green: '#10b981', yellow: '#fbbf24', red: '#ef4444' }

const TONE_STYLE = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  bad: 'border-red-200 bg-red-50 text-red-800',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
}

// Chart ka size aur jagah
const W = 340
const H = 170
const TOP = 8
const BOTTOM = 20
const INNER_H = H - TOP - BOTTOM

export default function TrendScreen({ budget, expenses, onBack }: Props) {
  const { t, locale } = useI18n()
  const today = getToday()
  const series = getDailySeries(budget, expenses, today)
  const past = series.filter((p) => !p.isFuture)
  const summary = getTrendSummary(budget, expenses, series)
  const info = getPaceInfo(summary.pace, summary.pastDays)

  const message =
    info.type === 'none'
      ? t.trend.notStarted
      : info.type === 'saved'
        ? t.trend.saved(rupee(info.amount))
        : info.type === 'overspent'
          ? t.trend.overspent(rupee(info.amount))
          : t.trend.exact

  const [selected, setSelected] = useState<string | null>(past[past.length - 1]?.date ?? null)
  const sel = series.find((p) => p.date === selected)

  const n = series.length
  const slot = W / n
  const maxY = Math.max(1, ...series.map((p) => Math.max(p.spent, p.limit))) * 1.15
  const y = (v: number) => TOP + INNER_H * (1 - v / maxY)
  const limitPoints = series.map((p, i) => `${(i + 0.5) * slot},${y(p.limit)}`).join(' ')

  return (
    <div className="p-5">
      <button className="mb-3 flex items-center gap-1 text-slate-500" onClick={onBack}>
        <ArrowLeft size={18} /> {t.common.back}
      </button>
      <h2 className="text-xl font-bold">{t.insights.trendTitle}</h2>
      <p className="mb-4 text-sm text-slate-500">{t.trend.subtitle}</p>

      <div className={`rounded-2xl border p-4 ${TONE_STYLE[info.tone]}`}>
        <div className="font-semibold">{message}</div>
        {summary.pastDays > 0 && (
          <>
            <div className="mt-1 text-sm opacity-80">
              {t.trend.allowedSpent(rupee(summary.allowed), rupee(summary.spent))}
            </div>
            <div className="mt-1 text-sm opacity-80">
              {summary.overDays === 0
                ? t.trend.noDaysOver
                : t.trend.overDays(summary.overDays, summary.pastDays)}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {sel && (
            <rect x={(sel.day - 1) * slot} y={TOP} width={slot} height={INNER_H} className="fill-indigo-50" />
          )}
          <line x1={0} x2={W} y1={TOP + INNER_H} y2={TOP + INNER_H} className="stroke-slate-200" />

          {series.map((p, i) => {
            const barW = slot * 0.66
            const x = i * slot + (slot - barW) / 2
            const h = p.spent > 0 ? Math.max(2, INNER_H * (p.spent / maxY)) : 0
            return (
              <g key={p.date}>
                {p.isFuture ? (
                  <rect x={x} y={TOP + INNER_H - 2} width={barW} height={2} className="fill-slate-200" />
                ) : (
                  <rect x={x} y={TOP + INNER_H - h} width={barW} height={h} rx={1.5} fill={BAR_COLOR[p.status]} />
                )}
                {(p.day === 1 || p.day % 5 === 0) && (
                  <text x={(i + 0.5) * slot} y={H - 5} fontSize={10} textAnchor="middle" className="fill-slate-400">
                    {p.day}
                  </text>
                )}
                {!p.isFuture && (
                  <rect
                    x={i * slot}
                    y={TOP}
                    width={slot}
                    height={INNER_H}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected(p.date)}
                  />
                )}
              </g>
            )
          })}

          <polyline
            points={limitPoints}
            fill="none"
            strokeWidth={1.2}
            strokeDasharray="4 3"
            className="stroke-slate-600"
          />
        </svg>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> {t.trend.legendWithin}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> {t.trend.legendClose}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> {t.trend.legendOver}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-0 w-4 border-t border-dashed border-slate-600" /> {t.trend.legendLimit}
          </span>
        </div>
      </div>

      {sel && !sel.isFuture && (
        <div className="mt-3 rounded-2xl bg-slate-50 p-4">
          <div className="font-semibold">{formatShortDate(sel.date, locale)}</div>
          <div className="text-sm text-slate-600">
            {rupee(sel.spent)} / {rupee(sel.limit)} · {t.status.day[sel.status]}
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">{t.trend.hint}</p>
    </div>
  )
}