import type { Expense, MonthBudget } from '../../shared/types'
import { getDailyLimitOn, getDaysInMonth, getPace, getStatus } from '../budget/budget'
import type { Status } from '../budget/budget'

export type DayPoint = {
  day: number
  date: string
  spent: number // sirf Regular
  limit: number
  status: Status
  isFuture: boolean
}

export function getDailySeries(budget: MonthBudget, expenses: Expense[], today: string): DayPoint[] {
  const spentByDate: Record<string, number> = {}
  for (const e of expenses) {
    if (e.kind === 'extra' || !e.date.startsWith(budget.month)) continue
    spentByDate[e.date] = (spentByDate[e.date] ?? 0) + e.amount
  }

  return Array.from({ length: getDaysInMonth(budget.month) }, (_, i) => {
    const day = i + 1
    const date = `${budget.month}-${String(day).padStart(2, '0')}`
    const spent = spentByDate[date] ?? 0
    const limit = getDailyLimitOn(budget, expenses, date)
    return { day, date, spent, limit, status: getStatus(spent, limit), isFuture: date > today }
  })
}

export function getTrendSummary(budget: MonthBudget, expenses: Expense[], series: DayPoint[]) {
  const past = series.filter((p) => !p.isFuture)
  const pastDays = past.length
  const overDays = past.filter((p) => p.status === 'red').length
  const pace = pastDays > 0 ? getPace(budget, expenses, past[pastDays - 1].date) : 0
  const spent = past.reduce((sum, p) => sum + p.spent, 0)
  return { pace, pastDays, overDays, spent, allowed: spent + pace }
}

export type PaceInfo =
  | { type: 'none' | 'exact'; tone: 'neutral' }
  | { type: 'saved'; tone: 'good'; amount: number }
  | { type: 'overspent'; tone: 'bad'; amount: number }

// Text yahan nahi banta, screen apni bhasha me banati hai
export function getPaceInfo(pace: number, pastDays: number): PaceInfo {
  if (pastDays === 0) return { type: 'none', tone: 'neutral' }
  if (pace > 0) return { type: 'saved', tone: 'good', amount: pace }
  if (pace < 0) return { type: 'overspent', tone: 'bad', amount: -pace }
  return { type: 'exact', tone: 'neutral' }
}