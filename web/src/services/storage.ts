import type { Category, Expense, Kind, MonthBudget } from '../shared/types'
import { kindOf } from '../shared/utils/kind'

export type AppData = {
  categories: Category[]
  expenses: Expense[]
  budgets: Record<string, MonthBudget> // key = "2026-10"
}

const KEY = 'budget-planner-data'

type Default = { key: string; name: string }

const DEFAULTS: Record<Kind, Default[]> = {
  regular: [
    { key: 'groceries', name: 'Groceries' },
    { key: 'food', name: 'Food' },
    { key: 'dairy', name: 'Dairy' },
    { key: 'travel', name: 'Travel' },
    { key: 'bills', name: 'Bills' },
    { key: 'other', name: 'Other' },
  ],
  extra: [
    { key: 'medical', name: 'Medical' },
    { key: 'entertainment', name: 'Entertainment' },
    { key: 'shopping', name: 'Shopping' },
    { key: 'repairs', name: 'Repairs' },
    { key: 'other', name: 'Other' },
  ],
}

// Pehle ke purane default naam jo ab nahi bante, par kisi ke data me ho sakte hain
const LEGACY: Record<Kind, Default[]> = {
  regular: [{ key: 'shopping', name: 'Shopping' }],
  extra: [],
}

const makeDefaults = (kind: Kind): Category[] =>
  DEFAULTS[kind].map(({ key, name }) => ({ id: crypto.randomUUID(), name, kind, key }))

// Purana data ko naye format me laata hai
export function migrate(data: AppData): AppData {
  let categories = data.categories

  if (!categories.some((c) => c.kind === 'extra')) {
    categories = [...categories, ...makeDefaults('extra')]
  }

  // Default naam wali categories ko key do, taaki Hindi me unka naam dikhe
  categories = categories.map((c) => {
    if (c.key) return c
    const kind = kindOf(c)
    const match = [...DEFAULTS[kind], ...LEGACY[kind]].find((d) => d.name === c.name)
    return match ? { ...c, key: match.key } : c
  })

  return { ...data, categories }
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