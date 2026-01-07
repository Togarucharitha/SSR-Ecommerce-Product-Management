import Link from 'next/link'
// Note: demo products are returned by the API only when the DB is empty.
// Do NOT merge demo products into the live product list here.
import AdminOnlyLink from '@/components/AdminOnlyLink'
import { getAllProducts } from '@/app/actions/products'
import DeleteProductButton from '@/components/DeleteProductButton'
import LogoutButton from '@/components/LogoutButton'

// Force dynamic SSR and disable caching for fresh product data
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

type DashboardPageProps = {
  searchParams?: {
    created?: string
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const res = await getAllProducts()

  if (!res?.success) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
          <div className="p-4 bg-white rounded shadow">Failed to load products: {res?.error ?? 'Unknown error'}</div>
        </div>
      </main>
    )
  }

  const products = res.data ?? []

  // show a visible banner when demo products are being used
  const usingDemo = (res as any)?.notice?.toString().toLowerCase().includes('demo')

  // `products` is the single source of truth returned by the API (may contain demo data
  // only when the DB is empty). Use it directly as the displayed list.
  const displayedProducts = products

  return (
    <main>
      <div className="container">
        <div className="flex flex-col gap-3 mb-6">
          {searchParams?.created === '1' && (
            <div className="rounded border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
              Product created successfully.
            </div>
          )}

          {usingDemo && (
            <div className="rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Demo products are being shown (no DB products found).
            </div>
          )}

            <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Products</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#4b5563' }}>Total: {displayedProducts.length}</div>
              <Link href="/dashboard/create" className="btn btn-primary">+ Create Product</Link>
              <AdminOnlyLink href="/dashboard/create-admin">Create Admin</AdminOnlyLink>
              <AdminOnlyLink href="/dashboard/metrics">Metrics</AdminOnlyLink>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="card">
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sales</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-600">No products yet.</td>
                </tr>
              )}
              {displayedProducts.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td>
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} />
                    ) : (
                      <div style={{ width: 60, height: 60, background: '#f3f4f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No image</div>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{typeof p.price === 'object' && p.price.toFixed ? p.price.toFixed(2) : p.price}</td>
                  <td>{p.stock}</td>
                  <td>{p.salesCount}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/dashboard/products/${p.id}`} className="btn btn-secondary">View</Link>
                      <Link href={`/dashboard/${p.id}/edit`} className="btn btn-secondary">Edit</Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
