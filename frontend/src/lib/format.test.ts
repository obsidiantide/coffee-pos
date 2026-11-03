import { describe, expect, it } from 'vitest'
import { azn } from '@/lib/format'

describe('azn', () => {
  it('formats numbers and numeric strings with two decimals', () => {
    expect(azn(12.5)).toBe('12.50 AZN')
    expect(azn('3')).toBe('3.00 AZN')
  })

  it('treats empty and invalid values as zero', () => {
    expect(azn(null)).toBe('0.00 AZN')
    expect(azn(undefined)).toBe('0.00 AZN')
    expect(azn('abc')).toBe('0.00 AZN')
  })
})
