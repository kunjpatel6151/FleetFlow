import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const containerStyle = {
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
const formStyle = {
  width: 360,
  padding: 24,
  border: '1px solid #ddd',
  borderRadius: 6,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
}
const fieldStyle = { display: 'block', width: '100%', padding: 8, marginBottom: 12 }

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', role: 'Dispatcher' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const onChange = (e) => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    if (!form.email || !form.password) return 'Email and password are required'
    // basic email check
    const emailRe = /^\S+@\S+\.\S+$/
    if (!emailRe.test(form.email)) return 'Enter a valid email'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errMsg = validate()
    if (errMsg) return setError(errMsg)

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', form)
      setSuccess('Registration successful — please login')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Register</h3>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          style={fieldStyle}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          style={fieldStyle}
        />

        <select name="role" value={form.role} onChange={onChange} style={fieldStyle}>
          <option>Manager</option>
          <option>Dispatcher</option>
          <option>Safety Officer</option>
          <option>Financial Analyst</option>
        </select>

        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Registering…' : 'Register'}
        </button>

        <div style={{ marginTop: 12 }}>
          <small>Already have an account? <a href="/login">Login</a></small>
        </div>
      </form>
    </div>
  )
}
