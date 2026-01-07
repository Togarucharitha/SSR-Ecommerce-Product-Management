import AdminMetrics from '@/components/AdminMetrics'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function MetricsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Metrics</h1>
          <Link href="/dashboard" className="px-3 py-2 border rounded">Back</Link>
        </div>

        <AdminMetrics />
      </div>
    </main>
  )
}
