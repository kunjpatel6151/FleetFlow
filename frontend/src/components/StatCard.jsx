import React from 'react'

export default function StatCard({ title, value, change, progress, icon }) {
  return (
    <div className="stat-card card">
      <div className="stat-row-top">
        <div>
          <div className="stat-label">{title}</div>
          <div className="stat-value">{value}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="stat-icon">{icon}</div>
          {change && (
            <div className="stat-indicator" style={{ color: change.startsWith('+') ? '#10b981' : 'var(--accent)' }}>
              {change}
            </div>
          )}
        </div>
      </div>
      {typeof progress === 'number' && (
        <div>
          <div className="progress"><i style={{ width: `${progress}%` }} /></div>
        </div>
      )}
    </div>
  )
}
