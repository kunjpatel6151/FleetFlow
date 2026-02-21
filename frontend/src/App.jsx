import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import MainLayout from './components/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function getRoleRedirect() {
  const role = localStorage.getItem('role')
  switch (role) {
    case 'Dispatcher': return '/trips'
    case 'Safety Officer': return '/maintenance'
    case 'Financial Analyst': return '/analytics'
    default: return '/dashboard'
  }
}

function RedirectIfLoggedIn({ children }) {
  const token = localStorage.getItem('token')
  if (token) return <Navigate to={getRoleRedirect()} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes — AuthLayout (no sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
        <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
      </Route>

      {/* Protected routes — MainLayout (sidebar + topbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<div style={{ color: '#e6eef8' }}><h2>Vehicles</h2><p>Coming soon...</p></div>} />
          <Route path="/trips" element={<div style={{ color: '#e6eef8' }}><h2>Trips</h2><p>Coming soon...</p></div>} />
          <Route path="/maintenance" element={<div style={{ color: '#e6eef8' }}><h2>Maintenance</h2><p>Coming soon...</p></div>} />
          <Route path="/analytics" element={<div style={{ color: '#e6eef8' }}><h2>Analytics</h2><p>Coming soon...</p></div>} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
