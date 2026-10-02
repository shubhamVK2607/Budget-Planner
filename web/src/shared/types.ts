export type Kind = 'regular' | 'extra'

export type Category = {
  id: string
  name: string
  archived?: boolean
  kind?: Kind // khali = regular (purane data ke liye)
}

export type Expense = {
  id: string
  amount: number
  categoryId: string
  date: string // "2026-10-01"
  note?: string
  kind?: Kind // khali = regular (purane data ke liye)
}

export type FixedItem = {
  id: string
  name: string
  amount: number
}

export type MonthBudget = {
  month: string // "2026-10"
  income: number
  fixedItems: FixedItem[]
  dailyLimitMode: 'auto' | 'manual'
  manualDailyLimit?: number
  extraMode?: 'percent' | 'amount'
  extraValue?: number
}