"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminOnlyLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

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

  if (!isAdmin) return null
  return <Link href={href} className="px-3 py-2 bg-gray-700 text-white rounded">{children}</Link>
}
