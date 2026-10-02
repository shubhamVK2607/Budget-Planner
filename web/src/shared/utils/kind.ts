import type { Kind } from '../types'

export const kindOf = (item: { kind?: Kind }): Kind => item.kind ?? 'regular'