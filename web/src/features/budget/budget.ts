import type { MonthBudget, FixedItem } from '../../shared/types'

export type Status = 'green' | 'yellow' | 'red'

export function getDaysInMonth(month: string): number {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
}

export function getTotalFixed(budget: MonthBudget): number {
  return budget.fixedItems.reduce((sum: number, item: FixedItem) => sum + item.amount, 0)
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

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function findPreviousBudget(
  budgets: Record<string, MonthBudget>,
  month: string
): MonthBudget | undefined {
  const earlier = Object.keys(budgets).filter((m) => m < month).sort()
  const last = earlier[earlier.length - 1]
  return last ? budgets[last] : undefined
}

export function copyBudget(source: MonthBudget, month: string): MonthBudget {
  return {
    ...source,
    month,
    fixedItems: source.fixedItems.map((item) => ({ ...item, id: crypto.randomUUID() })),
  }
}