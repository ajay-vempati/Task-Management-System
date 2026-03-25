import api from './client'

export const signup = async ({ email, password }) => {
  const res = await api.post('/api/auth/signup', { email, password })
  return res.data
}

export const login = async ({ email, password }) => {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data
}

