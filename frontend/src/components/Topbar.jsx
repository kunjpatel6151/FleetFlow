import React from 'react'

export default function Topbar({ searchValue, onSearch }) {
  const role = localStorage.getItem('role') || 'Dispatcher'
  const email = localStorage.getItem('email') || ''
  return (
    <div className="topbar">
      <div>
        <div className="breadcrumb">Home / Dashboard</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input className="input search" placeholder="Search trips, vehicles, drivers..." value={searchValue} onChange={(e)=>onSearch?.(e.target.value)} />
        <div className="profile">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: '#e6eef8' }}>{email || 'Operator'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{role}</div>
          </div>
          <div className="avatar">{(email||'O').charAt(0).toUpperCase()}</div>
        </div>
      </div>
    </div>
  )
}
