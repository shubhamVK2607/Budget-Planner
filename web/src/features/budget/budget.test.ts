import { describe, expect, it } from 'vitest'
import type { Expense, MonthBudget } from '../../shared/types'
import { getDailyLimit, getDailyLimitOn, getExtraBudget, getPool, getRegularBudget } from './budget'

// Oct 2026 = 31 din, pool = 1,00,000 − 75,000 = 25,000
const base: MonthBudget = {
  month: '2026-10',
  income: 100000,
  fixedItems: [{ id: '1', name: 'EMI', amount: 75000 }],
  dailyLimitMode: 'auto',
}

const withExtra = (extraMode: 'percent' | 'amount', extraValue: number): MonthBudget => ({
  ...base,
  extraMode,
  extraValue,
})

const expense = (amount: number, date: string, kind: 'regular' | 'extra'): Expense => ({
  id: crypto.randomUUID(),
  amount,
  categoryId: 'c1',
  date,
  kind,
})

describe('pool and daily limit', () => {
  it('works without any extra (old data)', () => {
    expect(getPool(base)).toBe(25000)
    expect(getExtraBudget(base)).toBe(0)
    expect(getDailyLimit(base)).toBe(806)
  })

  it('splits pool using 20% extra', () => {
    const b = withExtra('percent', 20)
    expect(getExtraBudget(b)).toBe(5000)
    expect(getRegularBudget(b)).toBe(20000)
    expect(getDailyLimit(b)).toBe(645)
  })

  it('supports extra as a fixed rupee amount', () => {
    const b = withExtra('amount', 10000)
    expect(getRegularBudget(b)).toBe(15000)
    expect(getDailyLimit(b)).toBe(483)
  })

  it('never lets extra exceed the pool', () => {
    expect(getExtraBudget(withExtra('amount', 99999))).toBe(25000)
  })

  it('manual mode: extra is whatever is left', () => {
    const b: MonthBudget = { ...base, dailyLimitMode: 'manual', manualDailyLimit: 500 }
    expect(getDailyLimit(b)).toBe(500)
    expect(getExtraBudget(b)).toBe(9500)
  })

  it('manual limit cannot exceed the maximum', () => {
    const b: MonthBudget = { ...base, dailyLimitMode: 'manual', manualDailyLimit: 5000 }
    expect(getDailyLimit(b)).toBe(806)
  })

  it('returns zero when fixed expenses exceed income', () => {
    const b: MonthBudget = { ...base, income: 50000 }
    expect(getDailyLimit(b)).toBe(0)
    expect(getExtraBudget(b)).toBe(0)
  })
})

describe('extra overflow', () => {
  const b = withExtra('percent', 20) // extra 5000, daily 645

  it('keeps the limit when extra stays within budget', () => {
    const list = [expense(4000, '2026-10-10', 'extra')]
    expect(getDailyLimitOn(b, list, '2026-10-11')).toBe(645)
  })

  it('reduces the limit from the next day after overflow', () => {
    const list = [expense(10000, '2026-10-10', 'extra')] // 5000 overflow
    expect(getDailyLimitOn(b, list, '2026-10-10')).toBe(645) // usi din nahi badlegi
    expect(getDailyLimitOn(b, list, '2026-10-11')).toBe(406) // 645 − 5000/21
  })

  it('does not change days before the overflow', () => {
    const list = [expense(10000, '2026-10-10', 'extra')]
    expect(getDailyLimitOn(b, list, '2026-10-05')).toBe(645)
  })

  it('ignores regular expenses', () => {
    const list = [expense(50000, '2026-10-10', 'regular')]
    expect(getDailyLimitOn(b, list, '2026-10-11')).toBe(645)
  })

  it('never goes below zero', () => {
    const list = [expense(10000, '2026-10-30', 'extra')] // sirf 1 din bacha
    expect(getDailyLimitOn(b, list, '2026-10-31')).toBe(0)
  })
})