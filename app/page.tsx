import Link from 'next/link'

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl p-8 bg-white rounded shadow text-center">
        <h1 className="text-3xl font-semibold mb-4">SSR E-Commerce Product Management</h1>
        <p className="mb-6 text-gray-600">SSR E-Commerce Product Management Dashboard</p>
        <div>
          <Link href="/login" className="btn btn-primary">Login as Admin</Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Only admin users can access the dashboard. Please login first.
        </p>
      </div>
    </main>
  )
}
