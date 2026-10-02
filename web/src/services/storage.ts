import type { Category, Expense, Kind, MonthBudget } from '../shared/types'

export type AppData = {
  categories: Category[]
  expenses: Expense[]
  budgets: Record<string, MonthBudget> // key = "2026-10"
}

const KEY = 'budget-planner-data'

const DEFAULT_NAMES: Record<Kind, string[]> = {
  regular: ['Groceries', 'Food', 'Dairy', 'Travel', 'Bills', 'Other'],
  extra: ['Medical', 'Entertainment', 'Shopping', 'Repairs', 'Other'],
}

const makeDefaults = (kind: Kind): Category[] =>
  DEFAULT_NAMES[kind].map((name) => ({ id: crypto.randomUUID(), name, kind }))

// Purana data ko naye format me laata hai (jaise Extra categories add karna)
function migrate(data: AppData): AppData {
  const hasExtra = data.categories.some((c) => c.kind === 'extra')
  if (hasExtra) return data
  return { ...data, categories: [...data.categories, ...makeDefaults('extra')] }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return migrate(JSON.parse(raw) as AppData)
  } catch {
    // corrupt data ho to default pe wapas
  }
  return {
    categories: [...makeDefaults('regular'), ...makeDefaults('extra')],
    expenses: [],
    budgets: {},
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}