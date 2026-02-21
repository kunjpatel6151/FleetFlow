import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Vehicles', path: '/vehicles' },
  { name: 'Trips', path: '/trips' },
  { name: 'Maintenance', path: '/maintenance' },
  { name: 'Analytics', path: '/analytics' },
]

export default function Sidebar() {
  const role = localStorage.getItem('role') || 'Dispatcher'
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('email')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">FL</div>
        <div>
          <div style={{ fontWeight: 800, color: '#e6eef8' }}>FLEET<span className="accent">FLOW</span></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{role}</div>
        </div>
      </div>

      <div className="menu">
        {menuItems.map(item => (
          <Link
            key={item.name}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: location.pathname === item.path ? 'var(--accent)' : 'rgba(255,255,255,0.03)' }} />
            <div style={{ fontWeight: 700 }}>{item.name}</div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '18px 0' }}>
        <button className="add-btn" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.04)', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)' }}>
          ↩ Logout
        </button>
      </div>
    </aside>
  )
}
