export function getToday(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// "2026-10" + 1 → "2026-11"
export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number)
  const d = new Date(year, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// "2026-10" → "October 2026"
export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// "2026-10-05" → "5 Oct"
export function formatShortDate(date: string): string {
  const [year, m, d] = date.split('-').map(Number)
  return new Date(year, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}