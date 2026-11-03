import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

interface Tokens {
  access: string | null
  refresh: string | null
}

interface AuthHooks {
  getTokens: () => Tokens
  onTokenRefresh: (tokens: { access: string }) => void
  onLogout: () => void
}

let hooks: AuthHooks | null = null

export function setAuthHooks(h: AuthHooks) {
  hooks = h
}

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const access = hooks?.getTokens().access
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshing: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const refresh = hooks?.getTokens().refresh
    const isAuthCall = original?.url?.startsWith('/auth/')
    if (error.response?.status !== 401 || !original || original._retry || isAuthCall || !refresh) {
      if (error.response?.status === 401 && !isAuthCall) hooks?.onLogout()
      return Promise.reject(error)
    }
    original._retry = true
    try {
      // Share one refresh request between concurrent 401 responses.
      refreshing ??= axios
        .post(`${baseURL}/auth/token/refresh/`, { refresh })
        .then((r) => r.data.access as string)
        .finally(() => {
          refreshing = null
        })
      const access = await refreshing
      hooks?.onTokenRefresh({ access })
      original.headers.Authorization = `Bearer ${access}`
      return api(original)
    } catch (e) {
      hooks?.onLogout()
      return Promise.reject(e)
    }
  },
)
