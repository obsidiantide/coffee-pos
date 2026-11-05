import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn() },
  setAuthHooks: vi.fn(),
}))

import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

const post = api.post as unknown as ReturnType<typeof vi.fn>

const initial = { user: null, access: null, refresh: null, loading: false, error: null }

beforeEach(() => {
  post.mockReset()
  useAuth.setState(initial)
})

describe('auth store', () => {
  it('stores user and tokens after a successful login', async () => {
    const user = { id: 1, username: 'barista' }
    post.mockResolvedValue({ data: { user, access: 'a1', refresh: 'r1' } })

    await useAuth.getState().login('barista', 'secret')

    expect(post).toHaveBeenCalledWith('/auth/login/', { username: 'barista', password: 'secret' })
    const s = useAuth.getState()
    expect(s.user).toEqual(user)
    expect(s.access).toBe('a1')
    expect(s.refresh).toBe('r1')
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('exposes the server detail message on a failed login and rethrows', async () => {
    post.mockRejectedValue({ response: { data: { detail: 'Bad credentials' } } })

    await expect(useAuth.getState().login('x', 'y')).rejects.toBeDefined()

    const s = useAuth.getState()
    expect(s.error).toBe('Bad credentials')
    expect(s.loading).toBe(false)
    expect(s.user).toBeNull()
  })

  it('falls back to non_field_errors, then to a generic message', async () => {
    post.mockRejectedValueOnce({ response: { data: { non_field_errors: ['Account disabled'] } } })
    await expect(useAuth.getState().login('x', 'y')).rejects.toBeDefined()
    expect(useAuth.getState().error).toBe('Account disabled')

    post.mockRejectedValueOnce(new Error('network'))
    await expect(useAuth.getState().login('x', 'y')).rejects.toBeDefined()
    expect(useAuth.getState().error).toBe('Login failed')
  })

  it('clears the session on logout even if the server call fails', async () => {
    useAuth.setState({ user: { id: 1 } as never, access: 'a', refresh: 'r' })
    post.mockRejectedValue(new Error('offline'))

    await useAuth.getState().logout()

    expect(post).toHaveBeenCalledWith('/auth/logout/', { refresh: 'r' })
    const s = useAuth.getState()
    expect([s.user, s.access, s.refresh]).toEqual([null, null, null])
  })

  it('skips the server call on logout when there is no refresh token', async () => {
    await useAuth.getState().logout()
    expect(post).not.toHaveBeenCalled()
  })
})
