export const rupee = (n: number) => '₹' + n.toLocaleString('en-IN')
export const digits = (v: string) => v.replace(/\D/g, '')

const trim = (x: number) => String(Math.round(x * 100) / 100)

// 125000 → "1.25 lakh"
export function inWords(n: number): string {
  if (n >= 10000000) return `${trim(n / 10000000)} crore`
  if (n >= 100000) return `${trim(n / 100000)} lakh`
  if (n >= 1000) return `${trim(n / 1000)} thousand`
  return ''
}