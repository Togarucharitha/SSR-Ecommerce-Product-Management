'use client'

import { useState } from 'react'

export default function CreateAdminPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleCreateAdmin() {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/_admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.message || 'Failed to create admin')
      } else {
        setMessage('✅ Admin created successfully')
        setName('')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      setMessage('❌ Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <h1>Create First Admin</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button
        onClick={handleCreateAdmin}
        disabled={loading}
        style={{ width: '100%', padding: 10 }}
      >
        {loading ? 'Creating...' : 'Create Admin'}
      </button>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  )
}

