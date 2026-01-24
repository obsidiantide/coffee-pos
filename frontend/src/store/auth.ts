import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setAuthHooks } from '@/lib/api'
import type { User } from '@/types'
import type { StateCreator } from 'zustand'

interface AuthState {
  user: User | null
  access: string | null
  refresh: string | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setTokens: (access: string, refresh: string) => void
}

const authCreator: StateCreator<AuthState> = (set, get) => ({
      user: null,
      access: null,
      refresh: null,
      loading: false,
      error: null,
      setTokens: (access, refresh) => set({ access, refresh }),
      login: async (username, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post('/auth/login/', { username, password })
          set({ user: data.user, access: data.access, refresh: data.refresh, loading: false })
        } catch (e: any) {
          const msg = e?.response?.data?.detail || e?.response?.data?.non_field_errors?.[0] || 'Login failed'
          set({ error: msg, loading: false })
          throw e
        }
      },
      logout: async () => {
        try {
          const refresh = get().refresh
          if (refresh) {
            await api.post('/auth/logout/', { refresh })
          }
        } catch (_) {}
        set({ user: null, access: null, refresh: null })
      },
})

export const useAuth = create<AuthState>()(
  persist(authCreator, { name: 'auth', partialize: (s) => ({ user: s.user, access: s.access, refresh: s.refresh }) }),
)

setAuthHooks({
  getTokens: () => ({ access: useAuth.getState().access, refresh: useAuth.getState().refresh }),
  onTokenRefresh: ({ access }) => useAuth.setState({ access }),
  onLogout: () => useAuth.getState().logout(),
})
