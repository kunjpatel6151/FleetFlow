import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../styles/auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'Dispatcher' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onChange = (e) => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    if (!form.email || !form.password) return 'Email and password are required'
    const emailRe = /^\S+@\S+\.\S+$/
    if (!emailRe.test(form.email)) return 'Enter a valid email'
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errMsg = validate()
    if (errMsg) return setError(errMsg)

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password })
      localStorage.setItem('token', res.data.token)
      if (res.data.role) localStorage.setItem('role', res.data.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-viewport">
      <div className="auth-card">
        <div className="auth-glow" />
        <div className="auth-inner">
          <div className="brand">
            <div className="logo" aria-hidden>
              <svg width="20" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h12v-4H3v4zM17 9h3l1 2v4h-4V9zM6 17a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z" fill="#081124"/></svg>
            </div>
            <div className="title">FLEET<span className="accent">FLOW</span></div>
          </div>

          <div className="heading">COMMAND ACCESS</div>
          <div className="subtext">Fleet & Logistics Management System v2.1</div>

          <form onSubmit={onSubmit}>
            <div className="form-field">
              <div className="label">Email</div>
              <input className="input" name="email" type="email" value={form.email} onChange={onChange} />
            </div>

            <div className="form-field">
              <div className="label">Password</div>
              <input className="input" name="password" type="password" value={form.password} onChange={onChange} />
            </div>

            <div className="form-field">
              <div className="label">Role</div>
              <select className="select" name="role" value={form.role} onChange={onChange}>
                <option>Manager</option>
                <option>Dispatcher</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
              </select>
            </div>

            <div className="muted-row">
              <div style={{ color: 'var(--muted)', fontSize: 13 }} />
              <a className="forgot" href="#">Forgot Password?</a>
            </div>

            {error && <div className="error">{error}</div>}

            <div style={{ marginTop: 8 }}>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'AUTHENTICATING...' : 'ACCESS'}
              </button>
            </div>
          </form>

          <div className="footer-note">🔒 Role-based access enforced · All data encrypted in transit</div>
        </div>
      </div>
    </div>
  )
}
