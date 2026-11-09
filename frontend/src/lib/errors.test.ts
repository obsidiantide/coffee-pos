import { describe, expect, it } from 'vitest'
import { getErrorMessage, getErrorStatus } from './errors'

describe('getErrorMessage', () => {
  it('prefers the detail field', () => {
    const err = { response: { data: { detail: 'No active account', non_field_errors: ['x'] } } }
    expect(getErrorMessage(err, 'Login failed')).toBe('No active account')
  })

  it('falls back to the first non_field_errors entry', () => {
    const err = { response: { data: { non_field_errors: ['Bad credentials'] } } }
    expect(getErrorMessage(err, 'Login failed')).toBe('Bad credentials')
  })

  it('returns the fallback for unknown shapes', () => {
    expect(getErrorMessage(new Error('boom'), 'Login failed')).toBe('Login failed')
    expect(getErrorMessage(null, 'Login failed')).toBe('Login failed')
    expect(getErrorMessage({ response: { data: null } }, 'Login failed')).toBe('Login failed')
    expect(getErrorMessage({ response: { data: { detail: 42 } } }, 'Login failed')).toBe('Login failed')
  })
})

describe('getErrorStatus', () => {
  it('reads the response status', () => {
    expect(getErrorStatus({ response: { status: 404 } })).toBe(404)
  })

  it('is undefined without a response', () => {
    expect(getErrorStatus(new Error('network'))).toBeUndefined()
    expect(getErrorStatus(undefined)).toBeUndefined()
  })
})
