import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  const role = localStorage.getItem('role')

  return (
    <aside>
      <h4>Menu</h4>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        {role === 'Manager' || role === 'Dispatcher' ? (
          <li><Link to="#" onClick={(e)=>{e.preventDefault(); alert('Use API: POST /api/trips')}}>Create Trip</Link></li>
        ) : null}
        {role === 'Manager' ? (
          <li><Link to="#" onClick={(e)=>{e.preventDefault(); alert('Use API: POST /api/vehicles')}}>Create Vehicle</Link></li>
        ) : null}
        {(role === 'Manager' || role === 'Safety Officer') ? (
          <li><Link to="#" onClick={(e)=>{e.preventDefault(); alert('Use API: GET /api/drivers/safety')}}>Safety Drivers</Link></li>
        ) : null}
        {(role === 'Manager' || role === 'Financial Analyst') ? (
          <li><Link to="#" onClick={(e)=>{e.preventDefault(); alert('Use API: GET /api/reports/roi')}}>ROI Reports</Link></li>
        ) : null}
      </ul>
    </aside>
  )
}
