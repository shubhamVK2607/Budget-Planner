import { describe, expect, it } from 'vitest'
import type { Category, Expense, Kind } from '../shared/types'
import { migrate } from './storage'
import type { AppData } from './storage'

const cat = (id: string, name: string, kind: Kind, key?: string): Category => ({ id, name, kind, key })
const exp = (id: string, categoryId: string, kind: Kind = 'regular'): Expense => ({
  id,
  amount: 100,
  categoryId,
  date: '2026-10-02',
  kind,
})

// Pehle wale default categories jaisa data
const oldCategories = (withKeys = true): Category[] => {
  const k = (key: string) => (withKeys ? key : undefined)
  return [
    cat('g', 'Groceries', 'regular', k('groceries')),
    cat('f', 'Food', 'regular', k('food')),
    cat('d', 'Dairy', 'regular', k('dairy')),
    cat('t', 'Travel', 'regular', k('travel')),
    cat('b', 'Bills', 'regular', k('bills')),
    cat('o', 'Other', 'regular', k('other')),
    cat('m', 'Medical', 'extra', k('medical')),
    cat('e', 'Entertainment', 'extra', k('entertainment')),
    cat('s', 'Shopping', 'extra', k('shopping')),
    cat('r', 'Repairs', 'extra', k('repairs')),
    cat('xo', 'Other', 'extra', k('other')),
  ]
}

const oldData = (expenses: Expense[] = [], withKeys = true): AppData => ({
  categories: oldCategories(withKeys),
  expenses,
  budgets: {},
})

const byId = (d: AppData, id: string) => d.categories.find((c) => c.id === id)
const keysOf = (d: AppData, kind: Kind) =>
  d.categories.filter((c) => c.kind === kind).map((c) => c.key)

describe('migrate to schema 2', () => {
  it('turns Food into Eating Out and keeps its expenses', () => {
    const r = migrate(oldData([exp('1', 'f')]))
    expect(byId(r, 'f')).toMatchObject({ key: 'eating_out', name: 'Eating Out' })
    expect(r.expenses[0].categoryId).toBe('f')
  })

  it('merges Dairy expenses into Groceries and removes Dairy', () => {
    const r = migrate(oldData([exp('1', 'd')]))
    expect(byId(r, 'd')).toBeUndefined()
    expect(r.expenses[0].categoryId).toBe('g')
  })

  it('turns an empty Bills into Home & Personal', () => {
    const r = migrate(oldData())
    expect(byId(r, 'b')).toMatchObject({ key: 'home_personal', name: 'Home & Personal' })
    expect(r.categories.filter((c) => c.key === 'home_personal')).toHaveLength(1)
  })

  it('keeps a used Bills as a custom category and adds Home & Personal', () => {
    const r = migrate(oldData([exp('1', 'b')]))
    expect(byId(r, 'b')?.name).toBe('Bills')
    expect(byId(r, 'b')?.key).toBeUndefined()
    expect(r.categories.some((c) => c.kind === 'regular' && c.key === 'home_personal')).toBe(true)
  })

  it('renames extra categories and adds the new ones', () => {
    const r = migrate(oldData())
    expect(byId(r, 'm')).toMatchObject({ key: 'medical', name: 'Medical & Health' })
    expect(byId(r, 'e')?.key).toBe('entertainment_trips')
    expect(byId(r, 'r')?.key).toBe('gadgets_repairs')
    expect(keysOf(r, 'extra')).toEqual([
      'medical',
      'shopping',
      'gadgets_repairs',
      'bills_recharge',
      'gifts_events',
      'entertainment_trips',
      'other',
    ])
    expect(keysOf(r, 'regular')).toEqual(['groceries', 'eating_out', 'travel', 'home_personal', 'other'])
  })

  it('recognises old default names even when keys are missing', () => {
    const r = migrate(oldData([exp('1', 'f')], false))
    expect(byId(r, 'f')?.key).toBe('eating_out')
  })

  it('never leaves an expense pointing at a missing category', () => {
    const list = [exp('1', 'd'), exp('2', 'f'), exp('3', 'b'), exp('4', 'xo', 'extra'), exp('5', 'g')]
    const r = migrate(oldData(list))
    for (const e of r.expenses) expect(byId(r, e.categoryId)).toBeDefined()
    expect(r.expenses).toHaveLength(list.length)
  })

  it('runs only once', () => {
    const once = migrate(oldData([exp('1', 'd')]))
    const custom = { ...once, categories: [...once.categories, cat('c1', 'Food', 'regular')] }
    const twice = migrate(custom)
    expect(twice).toEqual(custom)
    expect(byId(twice, 'c1')?.key).toBeUndefined()
  })
})