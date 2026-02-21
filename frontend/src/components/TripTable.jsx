import React from 'react'

const statusClass = (s) => {
  switch (s) {
    case 'Dispatched': return 'badge dispatched'
    case 'InTransit': return 'badge intransit'
    case 'Completed': return 'badge completed'
    case 'Cancelled': return 'badge cancelled'
    case 'Draft': return 'badge draft'
    default: return 'badge idle'
  }
}

export default function TripTable({ data = [], loading = false }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#e6eef8' }}>Recent Trips</h3>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Showing {data.length} trips</div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Trip</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading trips...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No trips found</td></tr>
          ) : (
            data.map((r) => (
              <tr key={r.tripNo}>
                <td>#{r.tripNo}</td>
                <td>{r.vehicle}</td>
                <td>{r.driver}</td>
                <td><span className={statusClass(r.status)}>{r.status}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
