import axios from 'axios'
import useAuthStore from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — silent token refresh on 401 ────────────────────
let refreshing = false
let queue      = []

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const store    = useAuthStore.getState()

    if (error.response?.status === 401 && !original._retry && store.refreshToken) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => { original.headers.Authorization = `Bearer ${token}`; resolve(api(original)) },
            reject,
          })
        })
      }

      original._retry = true
      refreshing      = true

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: store.refreshToken,
        })
        store.setTokens(data.access, data.refresh || store.refreshToken)
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`
        processQueue(null, data.access)
        return api(original)
      } catch (err) {
        processQueue(err, null)
        store.logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        refreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
