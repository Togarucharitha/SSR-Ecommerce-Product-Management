"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname() || ''

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/')

  return (
    <aside className="app-sidebar">
      <nav>
        <div className="sidebar-group">
          <div className="sidebar-heading">Dashboard</div>
          <Link href="/dashboard" className={"sidebar-link " + (isActive('/dashboard') ? 'sidebar-link-active' : '')}>Products</Link>
          <Link href="/dashboard/create" className={"sidebar-link " + (isActive('/dashboard/create') ? 'sidebar-link-active' : '')}>Create</Link>
          <Link href="/dashboard/metrics" className={"sidebar-link " + (isActive('/dashboard/metrics') ? 'sidebar-link-active' : '')}>Metrics</Link>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-heading">Admin</div>
          <Link href="/dashboard/create-admin" className={"sidebar-link " + (isActive('/dashboard/create-admin') ? 'sidebar-link-active' : '')}>Create Admin</Link>
        </div>
      </nav>
    </aside>
  )
}
