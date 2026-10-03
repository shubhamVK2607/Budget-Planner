import { migrate } from '../../services/storage'
import type { AppData } from '../../services/storage'
import { getToday } from '../../shared/utils/date'

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const invalid = () => new Error('This file is not a valid Budget Planner backup.')

// File ka text check karke AppData banata hai. Galat ho to error deta hai.
export function parseBackup(text: string): AppData {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw invalid()
  }
  if (!isObj(raw) || raw.app !== 'budget-planner' || !isObj(raw.data)) throw invalid()

  const d = raw.data
  const okCategories =
    Array.isArray(d.categories) &&
    d.categories.every((c) => isObj(c) && typeof c.id === 'string' && typeof c.name === 'string')
  const okExpenses =
    Array.isArray(d.expenses) &&
    d.expenses.every(
      (e) =>
        isObj(e) &&
        typeof e.id === 'string' &&
        typeof e.categoryId === 'string' &&
        typeof e.amount === 'number' &&
        Number.isFinite(e.amount) &&
        typeof e.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(e.date)
    )
  const okBudgets =
    isObj(d.budgets) &&
    Object.values(d.budgets).every(
      (b) =>
        isObj(b) &&
        typeof b.month === 'string' &&
        typeof b.income === 'number' &&
        Array.isArray(b.fixedItems) &&
        (b.dailyLimitMode === 'auto' || b.dailyLimitMode === 'manual')
    )

  if (!okCategories || !okExpenses || !okBudgets) throw invalid()
  return migrate(d as unknown as AppData)
}

export async function exportBackup(data: AppData): Promise<void> {
  const payload = { app: 'budget-planner', version: 1, exportedAt: new Date().toISOString(), data }
  const fileName = `budget-planner-backup-${getToday()}.json`
  const file = new File([JSON.stringify(payload, null, 2)], fileName, { type: 'application/json' })

  // Phone pe share sheet (Save to Files, WhatsApp...), warna normal download
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Budget Planner backup' })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}