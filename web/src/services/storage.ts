import type { Category, Expense, MonthBudget } from "../shared/types"


export type AppData = {
  categories: Category[]
  expenses: Expense[]
  budgets: Record<string, MonthBudget> // key = "2026-10"
}

const KEY = 'budget-planner-data'

const defaultCategories: Category[] = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'].map(
  (name) => ({ id: crypto.randomUUID(), name })
)

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    // corrupt data ho to default pe wapas
  }
  return { categories: defaultCategories, expenses: [], budgets: {} }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}