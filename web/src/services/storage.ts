import type { Category, Expense, Kind, MonthBudget } from '../shared/types'
import { kindOf } from '../shared/utils/kind'

export type AppData = {
  categories: Category[]
  expenses: Expense[]
  budgets: Record<string, MonthBudget> // key = "2026-10"
  schema?: number // data ka version, migration ke liye
}

const KEY = 'budget-planner-data'
const SCHEMA = 2

type Default = { key: string; name: string }

const DEFAULTS: Record<Kind, Default[]> = {
  regular: [
    { key: 'groceries', name: 'Groceries' },
    { key: 'eating_out', name: 'Eating Out' },
    { key: 'travel', name: 'Travel' },
    { key: 'home_personal', name: 'Home & Personal' },
    { key: 'other', name: 'Other' },
  ],
  extra: [
    { key: 'medical', name: 'Medical & Health' },
    { key: 'shopping', name: 'Shopping' },
    { key: 'gadgets_repairs', name: 'Gadgets & Repairs' },
    { key: 'bills_recharge', name: 'Bills & Recharge' },
    { key: 'gifts_events', name: 'Gifts & Events' },
    { key: 'entertainment_trips', name: 'Entertainment & Trips' },
    { key: 'other', name: 'Other' },
  ],
}

// Pehle wale default naam (bahut purane data me key nahi hoti, naam se pehchante hain)
const OLD_DEFAULTS: Record<Kind, Default[]> = {
  regular: [
    { key: 'groceries', name: 'Groceries' },
    { key: 'food', name: 'Food' },
    { key: 'dairy', name: 'Dairy' },
    { key: 'travel', name: 'Travel' },
    { key: 'bills', name: 'Bills' },
    { key: 'other', name: 'Other' },
    { key: 'shopping', name: 'Shopping' },
  ],
  extra: [
    { key: 'medical', name: 'Medical' },
    { key: 'entertainment', name: 'Entertainment' },
    { key: 'shopping', name: 'Shopping' },
    { key: 'repairs', name: 'Repairs' },
    { key: 'other', name: 'Other' },
  ],
}

// Purani category ko nayi pehchaan aur naam do (id wahi rehti hai, to kharche saath rehte hain)
const RENAMES: [Kind, string, Default][] = [
  ['regular', 'food', { key: 'eating_out', name: 'Eating Out' }],
  ['extra', 'medical', { key: 'medical', name: 'Medical & Health' }],
  ['extra', 'entertainment', { key: 'entertainment_trips', name: 'Entertainment & Trips' }],
  ['extra', 'repairs', { key: 'gadgets_repairs', name: 'Gadgets & Repairs' }],
]

const makeCategory = (kind: Kind, d: Default): Category => ({
  id: crypto.randomUUID(),
  name: d.name,
  kind,
  key: d.key,
})

const makeDefaults = (kind: Kind): Category[] => DEFAULTS[kind].map((d) => makeCategory(kind, d))

// Default categories apne order me, phir user ki banayi hui
function orderCategories(categories: Category[]): Category[] {
  const sorted = (kind: Kind) => {
    const rank = (c: Category) => {
      const i = DEFAULTS[kind].findIndex((d) => d.key === c.key)
      return i === -1 ? 999 : i
    }
    return categories
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => kindOf(c) === kind)
      .sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i)
      .map((x) => x.c)
  }
  return [...sorted('regular'), ...sorted('extra')]
}

// Purana data ko naye format me laata hai (sirf ek baar, jab tak schema 2 nahi hota)
export function migrate(data: AppData): AppData {
  if ((data.schema ?? 0) >= SCHEMA) return data

  let categories = data.categories.map((c) => ({ ...c }))
  let expenses = data.expenses

  // Step 1: jin categories me key nahi hai unhe naam se pehchano
  categories = categories.map((c) => {
    if (c.key) return c
    const match = OLD_DEFAULTS[kindOf(c)].find((d) => d.name === c.name)
    return match ? { ...c, key: match.key } : c
  })

  const find = (kind: Kind, key: string) =>
    categories.find((c) => kindOf(c) === kind && c.key === key)
  const hasExpenses = (id: string) => expenses.some((e) => e.categoryId === id)

  // Step 2: Dairy ke kharche Groceries me merge
  const dairy = find('regular', 'dairy')
  if (dairy) {
    const groceries = find('regular', 'groceries')
    if (groceries) {
      expenses = expenses.map((e) => (e.categoryId === dairy.id ? { ...e, categoryId: groceries.id } : e))
      categories = categories.filter((c) => c.id !== dairy.id)
    } else {
      dairy.key = 'groceries'
      dairy.name = 'Groceries'
    }
  }

  // Step 3: purani Regular "Bills": khali ho to Home & Personal, warna custom category rakho
  const bills = find('regular', 'bills')
  if (bills) {
    if (!hasExpenses(bills.id) && !find('regular', 'home_personal')) {
      bills.key = 'home_personal'
      bills.name = 'Home & Personal'
    } else {
      delete bills.key
    }
  }

  // Step 4: naam badalna (Food → Eating Out, Medical → Medical & Health ...)
  for (const [kind, from, to] of RENAMES) {
    const c = find(kind, from)
    if (c) {
      c.key = to.key
      c.name = to.name
    }
  }

  // Step 5: jo nayi default categories nahi hain wo jodo
  for (const kind of ['regular', 'extra'] as const) {
    for (const d of DEFAULTS[kind]) {
      if (!find(kind, d.key)) categories.push(makeCategory(kind, d))
    }
  }

  return { ...data, categories: orderCategories(categories), expenses, schema: SCHEMA }
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
    schema: SCHEMA,
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}