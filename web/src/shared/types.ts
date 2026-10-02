export type Category = {
  id: string
  name: string
  archived?: boolean
}

export type Expense = {
  id: string
  amount: number
  categoryId: string
  date: string // "2026-10-01"
  note?: string
  kind?: 'regular' | 'extra' // khali = regular (purane data ke liye)
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
  extraMode?: 'percent' | 'amount' // sirf auto mode me use hota hai
  extraValue?: number // percent ya rupees, extraMode ke hisaab se
}