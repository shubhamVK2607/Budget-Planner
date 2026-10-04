const pad = (n: number) => String(n).padStart(2, '0')

const toDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function getToday(): string {
  return toKey(new Date())
}

// "2026-10" + 1 → "2026-11"
export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number)
  const d = new Date(year, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

// "2026-10-01" − 1 din → "2026-09-30"
export function shiftDay(date: string, delta: number): string {
  const d = toDate(date)
  d.setDate(d.getDate() + delta)
  return toKey(d)
}

// "2026-01-31" + 1 mahina → "2026-02-28" (din number mahine ke andar rehta hai)
export function shiftMonthKeepDay(date: string, delta: number): string {
  const [year, m, day] = date.split('-').map(Number)
  const target = new Date(year, m - 1 + delta, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(Math.min(day, lastDay))}`
}

// "2026-10" → "October 2026"
export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// "2026-10-05" → "5 Oct"
export function formatShortDate(date: string): string {
  return toDate(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// "2026-10-05" → "5 Oct 2026"
export function formatFullDate(date: string): string {
  return toDate(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// "2026-10-05" → "Monday"
export function formatWeekday(date: string): string {
  return toDate(date).toLocaleDateString('en-IN', { weekday: 'long' })
}