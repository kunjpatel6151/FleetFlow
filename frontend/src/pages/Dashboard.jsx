import React, { useEffect, useState } from 'react'
import api from '../services/api'
import StatCard from '../components/StatCard'
import TripTable from '../components/TripTable'
import '../styles/dashboard.css'

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetch overview
        const overviewRes = await api.get('/dashboard/overview')
        console.log('Overview response:', overviewRes.data)
        setOverview(overviewRes.data)
      } catch (err) {
        console.error('Overview fetch failed:', err.response?.status, err.response?.data || err.message)
        setError('Failed to load overview data')
      }

      try {
        // Fetch trips separately so one failure doesn't break both
        const tripsRes = await api.get('/dashboard/trips')
        console.log('Trips response:', tripsRes.data)
        setTrips(tripsRes.data)
      } catch (err) {
        console.error('Trips fetch failed:', err.response?.status, err.response?.data || err.message)
      }

      setLoading(false)
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ color: '#e6eef8', marginTop: 0, marginBottom: 18 }}>Dashboard Overview</h2>

      {error && <div style={{ color: '#ff6b6b', marginBottom: 12, fontSize: 14 }}>{error}</div>}

      <div className="stats-row">
        <StatCard
          title="ACTIVE FLEET"
          value={overview ? overview.activeFleet : '—'}
          icon="🚛"
        />
        <StatCard
          title="MAINTENANCE ALERTS"
          value={overview ? overview.maintenanceAlerts : '—'}
          icon="🔧"
        />
        <StatCard
          title="FLEET UTILIZATION"
          value={overview ? `${overview.fleetUtilization}%` : '0%'}
          progress={overview ? overview.fleetUtilization : 0}
          icon="📊"
        />
        <StatCard
          title="PENDING CARGO"
          value={overview ? overview.pendingCargo : '—'}
          icon="📦"
        />
      </div>

      <TripTable data={trips} />
    </div>
  )
}
