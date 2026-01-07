import Link from 'next/link'
import CreateAdminForm from '@/components/CreateAdminForm'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function CreateAdminPage() {
  return (
    <main>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Admin — Create Admin</h1>
          <Link href="/dashboard" className="btn btn-secondary">Back</Link>
        </div>

        <div className="card">
          <div style={{ marginBottom: 12, color: '#b45309' }}>⚠️ Only existing admins can create new admins</div>
          <CreateAdminForm />
        </div>
      </div>
    </main>
  )
}
