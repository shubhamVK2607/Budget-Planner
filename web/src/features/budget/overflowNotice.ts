import type { Expense, MonthBudget } from '../../shared/types'
import { getToday, shiftDay } from '../../shared/utils/date'
import { getCurrentMonth, getDailyLimitOn, getExtraBudget, getOverflow } from './budget'

export type OverflowNotice = {
  extraBudget: number
  overflow: number
  tomorrow?: { was: number; now: number }
}

// Sirf tab deta hai jab is save se overflow badha ho
export function getOverflowNotice(
  budget: MonthBudget | undefined,
  before: Expense[],
  after: Expense[]
): OverflowNotice | null {
  if (!budget || budget.month !== getCurrentMonth()) return null

  const overflowBefore = getOverflow(budget, before)
  const overflowAfter = getOverflow(budget, after)
  if (overflowAfter <= overflowBefore) return null

  const notice: OverflowNotice = { extraBudget: getExtraBudget(budget), overflow: overflowAfter }

  const next = shiftDay(getToday(), 1)
  if (next.startsWith(budget.month)) {
    const was = getDailyLimitOn(budget, before, next)
    const now = getDailyLimitOn(budget, after, next)
    if (now < was) notice.tomorrow = { was, now }
  }
  return notice
}