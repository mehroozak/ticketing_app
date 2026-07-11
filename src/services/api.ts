import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import Toast from 'react-native-toast-message'
import { logout, setCredentials } from '../store/slices/authSlice'
import type { RefreshResponse } from '../types/auth'
import { END_POINTS } from '../lib/endpoints'

const getStore = () => import('../store/index').then((m) => m.store)

declare module 'axios' {
  export interface AxiosRequestConfig {
    // Set on requests that already handle their own failure silently (e.g. background sync)
    // so the response interceptor doesn't also surface a user-facing error toast.
    skipErrorToast?: boolean
  }
}

// const BASE_URL = __DEV__
//   ? 'https://itlcz-72-255-51-63.run.pinggy-free.link'
//   : 'https://api.passlay.com'

  const BASE_URL = 'https://qeqoy-154-57-223-189.run.pinggy-free.link'

const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Timezone': getTimezone(),
  },
})

// ── Secure API ────────────────────────────────────────────────────────────────

export const secureApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Timezone': getTimezone(),
  },
})

// ── Error parser ──────────────────────────────────────────────────────────────

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string | string[]> | null
}

// CustomRenderer's success wrapper shape — every endpoint response body looks like this
export interface ApiEnvelope<T> {
  message: string
  data: T
  errors: null
}

export interface ParsedApiError {
  message: string
  fieldErrors: string[] | null
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!axios.isAxiosError(error)) {
    return { message: 'An unexpected error occurred.', fieldErrors: null }
  }
  if (!error.response) {
    return { message: 'Network error. Please check your connection.', fieldErrors: null }
  }
  const body = error.response.data as ApiErrorBody | undefined
  const fieldErrors = body?.errors
    ? Object.entries(body.errors).map(
        ([field, val]) => `${field}: ${Array.isArray(val) ? val[0] : String(val)}`,
      )
    : null
  const message =
    body?.message ||
    (fieldErrors ? fieldErrors[0] : null) ||
    error.response.statusText ||
    'Something went wrong.'
  return { message, fieldErrors }
}

const showErrorToast = (message: string) => {
  Toast.show({ type: 'error', text1: message })
}

// ── publicApi — response interceptor ─────────────────────────────────────────

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const { message, fieldErrors } = parseApiError(error)
    showErrorToast(message)
    fieldErrors?.forEach((e) => showErrorToast(e))
    return Promise.reject(error)
  },
)

// ── secureApi — request interceptor (inject token + FormData fix) ─────────────

secureApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = await getStore()
    const token = store.getState().auth.access
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // For file uploads: remove Content-Type so axios sets multipart boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── secureApi — response interceptor (401 → refresh → retry) ─────────────────

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  refreshQueue = []
}

secureApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`
              }
              resolve(secureApi(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const store = await getStore()
        const refreshToken = store.getState().auth.refresh

        if (!refreshToken) throw new Error('No refresh token available')

        const { data } = await publicApi.post<RefreshResponse>(END_POINTS.TOKEN_REFRESH, {
          refresh: refreshToken,
        })

        const newAccess = data.access
        const newRefresh = data.refresh ?? refreshToken
        const currentUser = store.getState().auth.user

        store.dispatch(
          setCredentials({
            user: currentUser!,
            access: newAccess,
            refresh: newRefresh,
          }),
        )

        processQueue(null, newAccess)

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
        }

        return secureApi(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        const store = await getStore()
        store.dispatch(logout())
        // RootNavigator reacts to auth state — automatically redirects to Portal/Login
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Don't double-toast if it was a refresh endpoint failure, or if the caller opted out
    const isRefreshEndpoint = originalRequest.url?.includes(END_POINTS.TOKEN_REFRESH)
    if (!isRefreshEndpoint && !originalRequest.skipErrorToast) {
      const { message } = parseApiError(error)
      showErrorToast(message)
    }

    return Promise.reject(error)
  },
)
