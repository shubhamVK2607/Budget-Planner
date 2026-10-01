export const rupee = (n: number) => '₹' + n.toLocaleString('en-IN')
export const digits = (v: string) => v.replace(/\D/g, '')