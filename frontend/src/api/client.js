import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: apiBaseUrl,
})

let authToken = null
let onUnauthorized = null

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && typeof onUnauthorized === 'function') {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

export const setAuthToken = (token) => {
  authToken = token
}

export const setOnUnauthorized = (cb) => {
  onUnauthorized = cb
}

export default api

