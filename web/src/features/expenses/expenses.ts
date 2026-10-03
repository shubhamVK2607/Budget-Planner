import type { Expense, Kind } from '../../shared/types'
import { kindOf } from '../../shared/utils/kind'

export const sumAmount = (list: Expense[]) =>
  list.reduce((total, e) => total + e.amount, 0)

export const forDate = (list: Expense[], date: string) =>
  list.filter((e) => e.date === date)

export const forMonth = (list: Expense[], month: string) =>
  list.filter((e) => e.date.startsWith(month))

export const ofKind = (list: Expense[], kind: Kind) =>
  list.filter((e) => kindOf(e) === kind)

export function totalsByCategory(list: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const e of list) {
    totals[e.categoryId] = (totals[e.categoryId] ?? 0) + e.amount
  }
  return totals
}