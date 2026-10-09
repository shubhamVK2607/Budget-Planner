import { describe, expect, it } from 'vitest'
import type { Expense, MonthBudget } from '../../shared/types'
import { getDailySeries, getPaceInfo, getTrendSummary } from './trend'

// Oct 2026: pool 25,000, 31 din, daily limit 806
const base: MonthBudget = {
  month: '2026-10',
  income: 100000,
  fixedItems: [{ id: '1', name: 'EMI', amount: 75000 }],
  dailyLimitMode: 'auto',
}

const expense = (amount: number, date: string, kind: 'regular' | 'extra'): Expense => ({
  id: crypto.randomUUID(),
  amount,
  categoryId: 'c1',
  date,
  kind,
})

describe('getDailySeries', () => {
  const b: MonthBudget = { ...base, extraMode: 'percent', extraValue: 20 } // daily limit 645
  const list = [
    expense(300, '2026-10-02', 'regular'),
    expense(200, '2026-10-02', 'regular'),
    expense(4000, '2026-10-02', 'extra'),
  ]
  const series = getDailySeries(b, list, '2026-10-03')

  it('has one point per day', () => {
    expect(series).toHaveLength(31)
  })

  it('adds up regular expenses and ignores extra', () => {
    expect(series[1].spent).toBe(500)
    expect(series[1].limit).toBe(645)
  })

  it('marks days after today as future', () => {
    expect(series[2].isFuture).toBe(false)
    expect(series[3].isFuture).toBe(true)
  })
})

describe('getTrendSummary', () => {
  it('counts days over the limit, the pace and the totals', () => {
    const list = [expense(900, '2026-10-01', 'regular')] // 900 > 806 → red
    const series = getDailySeries(base, list, '2026-10-03')
    expect(getTrendSummary(base, list, series)).toEqual({
      pace: 1518,
      pastDays: 3,
      overDays: 1,
      spent: 900,
      allowed: 2418, // 3 × 806
    })
  })
})

describe('getPaceInfo', () => {
  it('describes each case', () => {
    expect(getPaceInfo(1518, 3)).toEqual({ type: 'saved', tone: 'good', amount: 1518 })
    expect(getPaceInfo(-200, 3)).toEqual({ type: 'overspent', tone: 'bad', amount: 200 })
    expect(getPaceInfo(0, 3).type).toBe('exact')
    expect(getPaceInfo(0, 0).type).toBe('none')
  })
})