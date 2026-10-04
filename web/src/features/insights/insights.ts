import type { Category, Expense, Kind } from '../../shared/types'
import { kindOf } from '../../shared/utils/kind'
import { shiftMonth } from '../../shared/utils/date'

export const PALETTE = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
  '#84cc16',
  '#f97316',
]

export type CategorySlice = {
  id: string
  name: string
  total: number
  share: number // 0 se 1
  change: number | null // pichhle mahine ke same period se % badlav
  isNew: boolean // pichhle mahine is category me kharcha nahi tha
  color: string
}

export type Insights = { total: number; slices: CategorySlice[]; hasPrev: boolean }

const sumByCategory = (list: Expense[]) => {
  const totals: Record<string, number> = {}
  for (const e of list) totals[e.categoryId] = (totals[e.categoryId] ?? 0) + e.amount
  return totals
}

export function getCategoryInsights(
  expenses: Expense[],
  categories: Category[],
  kind: Kind,
  month: string,
  today: string
): Insights {
  const prevMonth = shiftMonth(month, -1)
  // Chalte mahine me pichhle mahine ke bhi utne hi din tak compare karte hain
  const cutoffDay = month === today.slice(0, 7) ? Number(today.slice(8, 10)) : 31

  const current = expenses.filter((e) => kindOf(e) === kind && e.date.startsWith(month))
  const previous = expenses.filter(
    (e) => kindOf(e) === kind && e.date.startsWith(prevMonth) && Number(e.date.slice(8, 10)) <= cutoffDay
  )

  const cur = sumByCategory(current)
  const prev = sumByCategory(previous)
  const total = current.reduce((sum, e) => sum + e.amount, 0)
  const hasPrev = previous.length > 0
  const nameOf = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Unknown'

  const slices = Object.entries(cur)
    .filter(([, t]) => t > 0)
    .sort((a, b) => b[1] - a[1] || nameOf(a[0]).localeCompare(nameOf(b[0])))
    .map(([id, t], i) => {
      const p = prev[id] ?? 0
      return {
        id,
        name: nameOf(id),
        total: t,
        share: total > 0 ? t / total : 0,
        change: hasPrev && p > 0 ? Math.round(((t - p) / p) * 100) : null,
        isNew: hasPrev && p === 0,
        color: PALETTE[i % PALETTE.length],
      }
    })

  return { total, slices, hasPrev }
}