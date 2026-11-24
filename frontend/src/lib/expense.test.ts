import { describe, it, expect } from 'vitest'
import { validateExpense } from './expense'

describe('validateExpense', () => {
  it('accepts valid input and trims the description', () => {
    expect(validateExpense('  Milk ', '12.5')).toEqual({ ok: true, description: 'Milk', amount: 12.5 })
  })

  it('rejects empty or whitespace-only fields', () => {
    expect(validateExpense('', '5').ok).toBe(false)
    expect(validateExpense('   ', '5').ok).toBe(false)
    expect(validateExpense('Milk', '').ok).toBe(false)
    expect(validateExpense('Milk', '  ').ok).toBe(false)
  })

  it('rejects zero, negative and non-numeric amounts', () => {
    for (const bad of ['0', '0.00', '-3', 'abc', 'Infinity']) {
      const result = validateExpense('Milk', bad)
      expect(result).toEqual({ ok: false, error: 'Amount must be greater than zero' })
    }
  })

  it('rounds the amount to two decimals', () => {
    const result = validateExpense('Beans', '10.456')
    expect(result).toEqual({ ok: true, description: 'Beans', amount: 10.46 })
  })
})
