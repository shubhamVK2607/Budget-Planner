import { describe, expect, it } from 'vitest'
import type { Category, Expense, Kind } from '../../shared/types'
import { getCategoryInsights } from './insights'

const cats: Category[] = [
  { id: 'f', name: 'Food' },
  { id: 't', name: 'Travel' },
]

const ex = (amount: number, date: string, categoryId: string, kind: Kind = 'regular'): Expense => ({
  id: crypto.randomUUID(),
  amount,
  date,
  categoryId,
  kind,
})

describe('getCategoryInsights', () => {
  it('sorts by total and calculates share', () => {
    const list = [ex(100, '2026-10-02', 't'), ex(300, '2026-10-03', 'f')]
    const r = getCategoryInsights(list, cats, 'regular', '2026-10', '2026-10-10')
    expect(r.total).toBe(400)
    expect(r.slices[0].name).toBe('Food')
    expect(r.slices[0].share).toBe(0.75)
    expect(r.slices[1].name).toBe('Travel')
  })

  it('only counts the chosen kind', () => {
    const list = [ex(300, '2026-10-03', 'f'), ex(5000, '2026-10-03', 'f', 'extra')]
    expect(getCategoryInsights(list, cats, 'regular', '2026-10', '2026-10-10').total).toBe(300)
    expect(getCategoryInsights(list, cats, 'extra', '2026-10', '2026-10-10').total).toBe(5000)
  })

  it('compares with the same days of last month', () => {
    const list = [
      ex(150, '2026-10-03', 'f'),
      ex(100, '2026-09-05', 'f'), // 10 tareekh tak: gina jayega
      ex(500, '2026-09-20', 'f'), // 10 tareekh ke baad: nahi
    ]
    const r = getCategoryInsights(list, cats, 'regular', '2026-10', '2026-10-10')
    expect(r.slices[0].change).toBe(50)
  })

  it('marks a category as new when last month had no spending in it', () => {
    const list = [ex(50, '2026-10-03', 't'), ex(100, '2026-09-05', 'f')]
    const r = getCategoryInsights(list, cats, 'regular', '2026-10', '2026-10-10')
    expect(r.hasPrev).toBe(true)
    expect(r.slices[0].isNew).toBe(true)
    expect(r.slices[0].change).toBeNull()
  })

  it('shows no change info when last month has no data', () => {
    const list = [ex(50, '2026-10-03', 't')]
    const r = getCategoryInsights(list, cats, 'regular', '2026-10', '2026-10-10')
    expect(r.hasPrev).toBe(false)
    expect(r.slices[0].change).toBeNull()
    expect(r.slices[0].isNew).toBe(false)
  })

  it('compares a finished month with the whole previous month', () => {
    const list = [ex(200, '2026-09-25', 'f'), ex(100, '2026-08-28', 'f')]
    const r = getCategoryInsights(list, cats, 'regular', '2026-09', '2026-10-10')
    expect(r.slices[0].change).toBe(100)
  })
})