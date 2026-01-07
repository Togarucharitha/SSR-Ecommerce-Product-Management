"use client"

import React, { useState, useEffect } from 'react'

export default function CreateAdminForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
        const data = await res.json()
        if (!mounted) return
        if (data?.success && data.user?.role === 'admin') {
          setIsAdmin(true)
        }
      } catch (err) {
        // ignore - user not logged in, but form can still be used in bootstrap mode
      } finally {
        if (mounted) setIsChecking(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Show loading state while checking auth
  if (isChecking) {
    return <div className="p-4 bg-white rounded shadow text-sm text-gray-700">Checking permissions...</div>
  }

  // Show message if not admin, but still allow form submission (bootstrap mode handled by API)
  const showAdminOnlyMessage = !isAdmin

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch('/api/_admin/create-admin', {
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
      {showAdminOnlyMessage && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
          {isAdmin 
            ? 'Only existing admins can create new admins.'
            : 'No admin logged in. If this is the first admin, creation will proceed (bootstrap mode).'}
        </div>
      )}
      {message && (
        <div className={`mb-3 text-sm p-3 rounded ${
          message.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          className="form-input" 
          placeholder="Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required
        />
        <input 
          className="form-input" 
          placeholder="Email" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required
        />
        <input 
          className="form-input" 
          placeholder="Password (min 6 characters)" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          minLength={6}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  )
}
