import { describe, expect, it } from 'vitest'
import { parseBackup } from './backup'

describe('parseBackup', () => {
  it('imports old budgets without a savings target as zero', () => {
    const backup = {
      app: 'budget-planner',
      data: {
        schema: 2,
        categories: [],
        expenses: [],
        budgets: {
          '2026-10': {
            month: '2026-10',
            income: 50000,
            fixedItems: [],
            dailyLimitMode: 'auto',
          },
        },
      },
    }

    expect(parseBackup(JSON.stringify(backup)).budgets['2026-10'].savingsTarget).toBe(0)
  })

  it('preserves savings targets in current backup data', () => {
    const backup = {
      app: 'budget-planner',
      data: {
        schema: 3,
        categories: [],
        expenses: [],
        budgets: {
          '2026-10': {
            month: '2026-10',
            income: 50000,
            savingsTarget: 8000,
            fixedItems: [],
            dailyLimitMode: 'auto',
          },
        },
      },
    }

    expect(parseBackup(JSON.stringify(backup)).budgets['2026-10'].savingsTarget).toBe(8000)
  })
})
