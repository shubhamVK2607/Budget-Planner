import type { MonthBudget } from './types'

export type Status = 'green' | 'yellow' | 'red'

export function getDaysInMonth(month: string): number {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
}

export function getTotalFixed(budget: MonthBudget): number {
  return budget.fixedItems.reduce((sum, item) => sum + item.amount, 0)
}

export function getPool(budget: MonthBudget): number {
  return budget.income - getTotalFixed(budget)
}

export function getAutoDailyLimit(budget: MonthBudget): number {
  const pool = getPool(budget)
  if (pool <= 0) return 0
  return Math.floor(pool / getDaysInMonth(budget.month))
}

export function getDailyLimit(budget: MonthBudget): number {
  const max = getAutoDailyLimit(budget)
  if (budget.dailyLimitMode === 'auto') return max
  const manual = budget.manualDailyLimit ?? max
  return Math.min(manual, max)
}

export function getStatus(spent: number, limit: number): Status {
  if (limit <= 0) return spent > 0 ? 'red' : 'green'
  const ratio = spent / limit
  if (ratio > 1) return 'red'
  if (ratio >= 0.8) return 'yellow'
  return 'green'
}