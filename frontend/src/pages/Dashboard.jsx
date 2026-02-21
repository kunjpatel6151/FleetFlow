import React, { useEffect, useState } from 'react'
import api from '../services/api'

const containerStyle = { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const cardStyle = { padding: 24, border: '1px solid #eee', borderRadius: 6, textAlign: 'center' }

export default function Dashboard() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile')
        setProfile(res.data)
      } catch (err) {
        setProfile(null)
      }
    }
    fetchProfile()
  }, [])

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {profile ? (
          <>
            <h2>Welcome, {profile.role}</h2>
            <p style={{ marginTop: 8 }}>{profile.email}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}
