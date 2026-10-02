import type { Expense, MonthBudget } from '../../shared/types'

export type Status = 'green' | 'yellow' | 'red'

export function getDaysInMonth(month: string): number {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getTotalFixed(budget: MonthBudget): number {
  return budget.fixedItems.reduce((sum, item) => sum + item.amount, 0)
}

export function getPool(budget: MonthBudget): number {
  return budget.income - getTotalFixed(budget)
}

// Maximum possible daily limit (jab Extra = 0). Manual limit isse zyada nahi ho sakti.
export function getAutoDailyLimit(budget: MonthBudget): number {
  const pool = getPool(budget)
  if (pool <= 0) return 0
  return Math.floor(pool / getDaysInMonth(budget.month))
}

function getManualLimit(budget: MonthBudget): number {
  const max = getAutoDailyLimit(budget)
  return Math.min(budget.manualDailyLimit ?? max, max)
}

// Extra budget: auto me user batata hai (% ya ₹), manual me jo bacha wahi Extra.
export function getExtraBudget(budget: MonthBudget): number {
  const pool = getPool(budget)
  if (pool <= 0) return 0

  if (budget.dailyLimitMode === 'manual') {
    return Math.max(0, pool - getManualLimit(budget) * getDaysInMonth(budget.month))
  }

  const value = budget.extraValue ?? 0
  const extra = budget.extraMode === 'percent' ? Math.floor((pool * value) / 100) : value
  return Math.min(Math.max(extra, 0), pool)
}

export function getRegularBudget(budget: MonthBudget): number {
  return getPool(budget) - getExtraBudget(budget)
}

// Mahine ki shuruaat wali daily limit (overflow se pehle)
export function getDailyLimit(budget: MonthBudget): number {
  if (budget.dailyLimitMode === 'manual') return getManualLimit(budget)
  if (getPool(budget) <= 0) return 0
  return Math.floor(getRegularBudget(budget) / getDaysInMonth(budget.month))
}

const dayOf = (date: string) => Number(date.slice(8, 10))

// Extra overflow ki wajah se kisi din ki limit kitni kam hui.
// Rule: overflow jis din hua, uske agle din se bache hue dinon me barabar baant diya jata hai.
export function getOverflowReduction(budget: MonthBudget, expenses: Expense[], date: string): number {
  const days = getDaysInMonth(budget.month)
  const extraBudget = getExtraBudget(budget)

  const perDay: number[] = Array(days + 1).fill(0)
  for (const e of expenses) {
    if (e.kind === 'extra' && e.date.startsWith(budget.month)) perDay[dayOf(e.date)] += e.amount
  }

  let cumulative = 0
  let prevOverflow = 0
  let reduction = 0
  for (let t = 1; t < dayOf(date); t++) {
    cumulative += perDay[t]
    const overflow = Math.max(0, cumulative - extraBudget)
    const increase = overflow - prevOverflow
    if (increase > 0 && days - t > 0) reduction += increase / (days - t)
    prevOverflow = overflow
  }
  return reduction
}

// Kisi bhi din ki asli daily limit (overflow ke baad)
export function getDailyLimitOn(budget: MonthBudget, expenses: Expense[], date: string): number {
  const limit = getDailyLimit(budget) - getOverflowReduction(budget, expenses, date)
  return Math.max(0, Math.floor(limit))
}

export function getStatus(spent: number, limit: number): Status {
  if (limit <= 0) return spent > 0 ? 'red' : 'green'
  const ratio = spent / limit
  if (ratio > 1) return 'red'
  if (ratio >= 0.8) return 'yellow'
  return 'green'
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