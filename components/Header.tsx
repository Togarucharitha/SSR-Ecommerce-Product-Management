"use client"

import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function Header() {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="app-title">SSR E-Commerce Product Management</div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/" className="btn btn-secondary">Home</Link>
        <LogoutButton />
      </div>
    </header>
  )
}
