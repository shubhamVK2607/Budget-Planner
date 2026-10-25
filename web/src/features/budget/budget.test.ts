import { describe, expect, it } from 'vitest'
import type { Expense, MonthBudget } from '../../shared/types'
import {
  getDailyLimit,
  getDailyLimitOn,
  getExtraBudget,
  getOverflow,
  getPace,
  getPool,
  getRegularBudget,
  getSavings,
  getSavingsCrossing,
  getSpendable,
  isRegularBudgetFinishedOn,
} from './budget'

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

  it('subtracts the savings target before fixed expenses', () => {
    const b = { ...base, savingsTarget: 20000, fixedItems: [{ id: '1', name: 'EMI', amount: 60000 }] }
    expect(getSpendable(b)).toBe(80000)
    expect(getPool(b)).toBe(20000)
  })
})

describe('extra overflow', () => {
  const b = withExtra('percent', 20) // extra 5000, daily 645

  it('keeps the limit when extra stays within budget', () => {
    const list = [expense(4000, '2026-10-10', 'extra')]
    expect(getDailyLimitOn(b, list, '2026-10-11')).toBe(952)
  })

  it('reduces the limit from the next day after overflow', () => {
    const list = [expense(10000, '2026-10-10', 'extra')] // 5000 overflow
    expect(getDailyLimitOn(b, list, '2026-10-10')).toBe(909) // usi din nahi badlegi
    expect(getDailyLimitOn(b, list, '2026-10-11')).toBe(714) // (20,000 − 5,000) / 21
  })

  it('does not change days before the overflow', () => {
    const list = [expense(10000, '2026-10-10', 'extra')]
    expect(getDailyLimitOn(b, list, '2026-10-05')).toBe(740)
  })

  it('ignores regular expenses', () => {
    const list = [expense(50000, '2026-10-10', 'regular')]
    expect(getDailyLimitOn(b, list, '2026-10-11')).toBe(0)
  })

  it('never goes below zero', () => {
    const list = [expense(10000, '2026-10-30', 'extra')] // sirf 1 din bacha
    expect(getDailyLimitOn(b, list, '2026-10-31')).toBe(15000)
  })

  it('adjusts for regular spending before the selected day and raises the limit after underspending', () => {
    const b: MonthBudget = {
      month: '2026-04',
      income: 30000,
      fixedItems: [],
      dailyLimitMode: 'auto',
    }
    const list = [
      ...[1, 2, 3, 4].map((day) => expense(1000, `2026-04-${String(day).padStart(2, '0')}`, 'regular')),
      expense(10000, '2026-04-05', 'regular'),
    ]
    expect(getDailyLimitOn(b, list, '2026-04-05')).toBe(1000)
    expect(getDailyLimitOn(b, list, '2026-04-06')).toBe(640)
    expect(getDailyLimitOn(b, [], '2026-04-02')).toBe(1034)
  })

  it('returns zero and marks the regular budget finished once its remaining funds are spent', () => {
    const b: MonthBudget = {
      month: '2026-04',
      income: 30000,
      fixedItems: [],
      dailyLimitMode: 'auto',
    }
    const list = [expense(30000, '2026-04-05', 'regular')]
    expect(getDailyLimitOn(b, list, '2026-04-06')).toBe(0)
    expect(isRegularBudgetFinishedOn(b, list, '2026-04-06')).toBe(true)
  })

  it('does not change a day limit when spending is added on that same day or later', () => {
    const b = withExtra('amount', 0)
    const before = getDailyLimitOn(b, [], '2026-10-05')
    const after = [expense(10000, '2026-10-05', 'regular')]
    expect(getDailyLimitOn(b, after, '2026-10-05')).toBe(before)
    expect(getDailyLimitOn(b, after, '2026-10-04')).toBe(getDailyLimitOn(b, [], '2026-10-04'))
  })
})

describe('getOverflow', () => {
  const b = withExtra('percent', 20) // extra budget 5000

  it('is zero while extra is within budget', () => {
    expect(getOverflow(b, [expense(4000, '2026-10-10', 'extra')])).toBe(0)
  })

  it('returns the amount over budget', () => {
    const list = [expense(4000, '2026-10-10', 'extra'), expense(3000, '2026-10-12', 'extra')]
    expect(getOverflow(b, list)).toBe(2000)
  })
})

describe('getPace', () => {
  it('is ahead when spending less than allowed so far', () => {
    const list = [expense(900, '2026-10-01', 'regular')]
    expect(getPace(base, list, '2026-10-03')).toBe(1540)
  })

  it('is behind when spending more than allowed', () => {
    const list = [expense(3000, '2026-10-01', 'regular')]
    expect(getPace(base, list, '2026-10-02')).toBe(-1461)
  })

  it('ignores extra expenses', () => {
    const b = withExtra('percent', 20) // daily 645, extra budget 5000
    const list = [expense(4000, '2026-10-01', 'extra')]
    expect(getPace(b, list, '2026-10-02')).toBe(1311)
  })
})

describe('savings', () => {
  const b: MonthBudget = {
    month: '2026-10',
    income: 100000,
    savingsTarget: 20000,
    fixedItems: [],
    dailyLimitMode: 'auto',
  }

  it('keeps planned savings until total spending crosses spendable', () => {
    expect(getSavings(b, [expense(80000, '2026-10-10', 'regular')], '2026-10')).toBe(20000)
    expect(getSavings(b, [expense(81200, '2026-10-10', 'regular')], '2026-10')).toBe(18800)
  })

  it('counts unspent income as savings for a past month', () => {
    expect(getSavings(b, [expense(75000, '2026-10-10', 'regular')], '2026-11')).toBe(25000)
  })

  it('returns zero at income and a negative balance after income is exceeded', () => {
    expect(getSavings(b, [expense(100000, '2026-10-10', 'regular')], '2026-10')).toBe(0)
    expect(getSavings(b, [expense(100100, '2026-10-10', 'regular')], '2026-10')).toBe(-100)
  })

  it('reports only transitions across budget lines', () => {
    const atSpendable = [expense(80000, '2026-10-10', 'regular')]
    const overSpendable = [expense(81200, '2026-10-10', 'regular')]
    const atIncome = [expense(100000, '2026-10-10', 'regular')]
    const oneShortOfIncome = [expense(99999, '2026-10-10', 'regular')]
    expect(getSavingsCrossing(b, [], atSpendable)).toBeNull()
    expect(getSavingsCrossing(b, atSpendable, overSpendable)).toBe('spendable')
    expect(getSavingsCrossing(b, oneShortOfIncome, atIncome)).toBe('income')
    expect(getSavingsCrossing(b, [], atIncome)).toBe('income')
    expect(getSavingsCrossing(b, atIncome, [expense(100001, '2026-10-10', 'regular')])).toBeNull()
  })

  it('leaves manual daily limits unaffected by regular spending', () => {
    const manual: MonthBudget = { ...base, dailyLimitMode: 'manual', manualDailyLimit: 500 }
    expect(getDailyLimitOn(manual, [expense(20000, '2026-10-01', 'regular')], '2026-10-11')).toBe(500)
  })
})