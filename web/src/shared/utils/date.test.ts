import { describe, expect, it } from 'vitest'
import { shiftDay, shiftMonthKeepDay } from './date'

describe('shiftDay', () => {
  it('moves across month and year boundaries', () => {
    expect(shiftDay('2026-10-01', -1)).toBe('2026-09-30')
    expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01')
    expect(shiftDay('2026-10-04', 1)).toBe('2026-10-05')
  })
})

describe('shiftMonthKeepDay', () => {
  it('keeps the same day number', () => {
    expect(shiftMonthKeepDay('2026-10-04', -1)).toBe('2026-09-04')
    expect(shiftMonthKeepDay('2026-12-15', 1)).toBe('2027-01-15')
  })

  it('stays inside shorter months', () => {
    expect(shiftMonthKeepDay('2026-10-31', -1)).toBe('2026-09-30')
    expect(shiftMonthKeepDay('2026-01-31', 1)).toBe('2026-02-28')
    expect(shiftMonthKeepDay('2028-01-31', 1)).toBe('2028-02-29')
  })
})