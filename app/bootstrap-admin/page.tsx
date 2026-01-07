import Link from 'next/link'
import CreateAdminForm from '@/components/CreateAdminForm'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * Public bootstrap page for creating the first admin user
 * This page is accessible without authentication and allows creating
 * the first admin when the database is empty.
 */
export default function BootstrapAdminPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create First Admin</h1>
          <p className="text-gray-600">
            This page allows you to create the first admin user for your application.
            Once an admin exists, you'll need to log in to create additional admins.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded">
            <strong>Note:</strong> This is a one-time bootstrap process. After creating the first admin,
            you can log in and access the dashboard.
          </div>
          <CreateAdminForm />
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Already have an admin account? Go to Login →
          </Link>
        </div>
      </div>
    </main>
  )
}

