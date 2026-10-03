import type { Expense, MonthBudget } from '../../shared/types'
import { rupee } from '../../shared/utils/format'
import { getCurrentMonth, getDailyLimitOn, getExtraBudget, getOverflow } from './budget'

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Sirf tab message deta hai jab is save se overflow badha ho
export function getOverflowNotice(
  budget: MonthBudget | undefined,
  before: Expense[],
  after: Expense[]
): string | null {
  if (!budget || budget.month !== getCurrentMonth()) return null

  const overflowBefore = getOverflow(budget, before)
  const overflowAfter = getOverflow(budget, after)
  if (overflowAfter <= overflowBefore) return null

  let message = `Your extra expenses budget of ${rupee(getExtraBudget(budget))} is over by ${rupee(overflowAfter)}.`

  const next = tomorrow()
  if (next.startsWith(budget.month)) {
    const was = getDailyLimitOn(budget, before, next)
    const now = getDailyLimitOn(budget, after, next)
    if (now < was) message += ` From tomorrow, your daily limit is ${rupee(now)} (was ${rupee(was)}).`
  }
  return message
}