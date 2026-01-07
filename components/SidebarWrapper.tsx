"use client"

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function SidebarWrapper() {
  const pathname = usePathname()
  if (!pathname) return null
  // show sidebar only for dashboard routes
  if (pathname.startsWith('/dashboard')) return <Sidebar />
  return null
}
