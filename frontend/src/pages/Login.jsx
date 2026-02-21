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

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onChange = (e) => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    if (!form.email || !form.password) return 'Email and password are required'
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errMsg = validate()
    if (errMsg) return setError(errMsg)

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
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
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Login</h3>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

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

        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <div style={{ marginTop: 12 }}>
          <small>Don't have an account? <a href="/register">Register</a></small>
        </div>
      </form>
    </div>
  )
}
