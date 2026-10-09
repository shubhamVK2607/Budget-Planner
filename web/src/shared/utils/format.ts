export const rupee = (n: number) => '₹' + n.toLocaleString('en-IN')
export const digits = (v: string) => v.replace(/\D/g, '')

const trim = (x: number) => String(Math.round(x * 100) / 100)

export type NumberUnits = { crore: string; lakh: string; thousand: string }

// 125000 → "1.25 lakh"
export function inWords(n: number, u: NumberUnits): string {
  if (n >= 10000000) return `${trim(n / 10000000)} ${u.crore}`
  if (n >= 100000) return `${trim(n / 100000)} ${u.lakh}`
  if (n >= 1000) return `${trim(n / 1000)} ${u.thousand}`
  return ''
}