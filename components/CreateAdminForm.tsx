"use client"

import React, { useState, useEffect } from 'react'

export default function CreateAdminForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
        const data = await res.json()
        if (!mounted) return
        if (data?.success && data.user?.role === 'admin') setIsAdmin(true)
      } catch (err) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  if (!isAdmin) {
    return <div className="p-4 bg-white rounded shadow text-sm text-gray-700">Only admins can create new admin accounts.</div>
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (data?.success) {
        setMessage('Admin created successfully')
        setName('')
        setEmail('')
        setPassword('')
      } else {
        setMessage(data?.error || 'Failed to create admin')
      }
    } catch (err: any) {
      setMessage(err?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-md">
      <h2 className="text-lg font-semibold mb-2">Create Admin</h2>
      {message && <div className="mb-3 text-sm text-gray-700">{message}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="form-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="form-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="form-input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Creating...' : 'Create Admin'}</button>
        </div>
      </form>
    </div>
  )
}
