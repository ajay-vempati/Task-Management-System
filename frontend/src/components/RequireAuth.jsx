import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function RequireAuth() {
  const { isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="app-container">Loading...</div>
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}

