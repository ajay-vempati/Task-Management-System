import { useContext } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const { user, doLogout } = useContext(AuthContext)
  const navigate = useNavigate()

  const onLogout = () => {
    doLogout()
    navigate('/login')
  }

  return (
    <div className="app-container">
      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div className="row" style={{ alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Task Tracker</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {user?.email}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'badge badge-primary' : 'badge')}>
              Tasks
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'badge badge-primary' : 'badge')}>
              Analytics
            </NavLink>
            <ThemeToggle />
            <button className="btn btn-danger" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  )
}

