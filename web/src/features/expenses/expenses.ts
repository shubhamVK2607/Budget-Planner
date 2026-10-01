import type { Expense } from '../../shared/types'

export const sumAmount = (list: Expense[]) =>
  list.reduce((total, e) => total + e.amount, 0)

export const forDate = (list: Expense[], date: string) =>
  list.filter((e) => e.date === date)

export const forMonth = (list: Expense[], month: string) =>
  list.filter((e) => e.date.startsWith(month))

export function totalsByCategory(list: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const e of list) {
    totals[e.categoryId] = (totals[e.categoryId] ?? 0) + e.amount
  }
  return totals
}