"use client"

import React, { useState, useEffect } from 'react'

export default function CreateAdminForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        console.log('[CreateAdminForm] Checking admin status...')
        const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
        const data = await res.json()
        if (!mounted) return
        if (data?.success && data.user?.role === 'admin') {
          console.log('[CreateAdminForm] User is admin')
          setIsAdmin(true)
        } else {
          console.log('[CreateAdminForm] User is not admin or not authenticated')
        }
      } catch (err) {
        console.error('[CreateAdminForm] Error checking admin status:', err)
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
      console.log('[CreateAdminForm] Submitting form with email:', email)

      const requestBody = { name, email, password }
      console.log('[CreateAdminForm] Request body prepared')

      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log('[CreateAdminForm] Response status:', res.status, res.statusText)
      console.log('[CreateAdminForm] Response headers:', Object.fromEntries(res.headers.entries()))

      // Check if response is okay
      if (!res.ok) {
        console.error('[CreateAdminForm] Response not OK:', res.status)
      }

      // Safely parse JSON
      let data: any
      try {
        const contentType = res.headers.get('content-type')
        console.log('[CreateAdminForm] Content-Type:', contentType)

        if (!contentType?.includes('application/json')) {
          const text = await res.text()
          console.error('[CreateAdminForm] Response is not JSON. Content-Type:', contentType, 'Body:', text.slice(0, 200))
          setMessage({
            type: 'error',
            text: `Server returned non-JSON response (${res.status}): ${contentType || 'unknown type'}`
          })
          setLoading(false)
          return
        }

        data = await res.json()
        console.log('[CreateAdminForm] JSON parsed successfully:', data)
      } catch (parseErr: any) {
        console.error('[CreateAdminForm] Failed to parse JSON:', parseErr?.message)
        const responseText = await res.text()
        console.error('[CreateAdminForm] Raw response text:', responseText.slice(0, 300))
        setMessage({
          type: 'error',
          text: `Failed to parse server response: ${parseErr?.message}`
        })
        setLoading(false)
        return
      }

      // Handle success
      if (data?.success) {
        console.log('[CreateAdminForm] Admin created successfully:', data.user?.email)
        setMessage({
          type: 'success',
          text: `✅ ${data.message || 'Admin created successfully'}`
        })
        setName('')
        setEmail('')
        setPassword('')
      } else {
        // Handle error response
        const errorMsg = data?.error || 'Failed to create admin'
        const details = data?.details ? ` - ${JSON.stringify(data.details).slice(0, 100)}` : ''
        console.error('[CreateAdminForm] API returned error:', errorMsg, details)
        setMessage({
          type: 'error',
          text: `❌ ${errorMsg}${details}`
        })
      }
    } catch (err: any) {
      console.error('[CreateAdminForm] Unexpected error during submission:', err?.message, err)
      setMessage({
        type: 'error',
        text: `❌ Request failed: ${err?.message || 'Unknown error'}`
      })
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
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          className="form-input" 
          placeholder="Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required
          disabled={loading}
        />
        <input 
          className="form-input" 
          placeholder="Email" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required
          disabled={loading}
        />
        <input 
          className="form-input" 
          placeholder="Password (min 6 characters)" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          minLength={6}
          required
          disabled={loading}
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
