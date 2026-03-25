import { createContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken, setOnUnauthorized } from '../api/client'
import * as authApi from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setAuthToken(token || null)
  }, [token])

  useEffect(() => {
    setOnUnauthorized(() => {
      // If the token is invalid/expired, force logout.
      doLogout()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const doLogin = async (email, password) => {
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return data
    } finally {
      setLoading(false)
    }
  }

  const doSignup = async (email, password) => {
    setLoading(true)
    try {
      const data = await authApi.signup({ email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return data
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      doLogin,
      doSignup,
      doLogout,
      isAuthenticated: Boolean(token),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

