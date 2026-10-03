import type { Category, Expense, Kind } from '../../shared/types'
import { kindOf } from '../../shared/utils/kind'
import { rupee } from '../../shared/utils/format'

export type QuickTemplate = {
  key: string
  label: string
  amount: number
  categoryId: string
  kind: Kind
  note?: string
}

// Pichhle 100 kharche me se sabse zyada repeat hone wale (tie me sabse recent) top 5
export function getQuickTemplates(expenses: Expense[], categories: Category[], limit = 5): QuickTemplate[] {
  const active = new Map(categories.filter((c) => !c.archived).map((c) => [c.id, c.name]))
  const stats = new Map<string, { count: number; last: number; e: Expense }>()

  expenses.slice(-100).forEach((e, i) => {
    if (!active.has(e.categoryId)) return
    const key = `${kindOf(e)}|${e.categoryId}|${e.amount}|${e.note ?? ''}`
    const prev = stats.get(key)
    stats.set(key, { count: (prev?.count ?? 0) + 1, last: i, e })
  })

  return [...stats.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last)
    .slice(0, limit)
    .map(([key, { e }]) => ({
      key,
      label: `${e.note || active.get(e.categoryId)} · ${rupee(e.amount)}`,
      amount: e.amount,
      categoryId: e.categoryId,
      kind: kindOf(e),
      note: e.note,
    }))
}