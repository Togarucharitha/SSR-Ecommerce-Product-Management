import Link from 'next/link'
import { getProduct } from '@/app/actions/products'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

type Props = {
  params: { id: string }
}

export default async function ProductViewPage({ params }: Props) {
  const res = await getProduct(params.id)

  if (!res?.success) {
    return (
      <main>
        <div className="container">
          <div className="card">Product not found or failed to load.</div>
        </div>
      </main>
    )
  }

  const p = res.data

  if (!p) {
      return (
        <main>
          <div className="container">
            <div className="card">Product not found.</div>
          </div>
        </main>
      )
    }

  // Work around strict typing: cast to `any` after runtime guard so JSX doesn't complain.
  const prod: any = p

  const priceDisplay = typeof prod.price === 'object' && prod.price?.toFixed ? prod.price.toFixed(2) : String(prod.price)

  return (
    <main>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{prod.name}</h1>
          <Link href="/dashboard" className="btn btn-secondary">Back</Link>
        </div>

        <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ width: 360, maxWidth: '40%' }}>
            {p.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div style={{ width: '100%', height: 280, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No image</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Category</div>
              <div style={{ fontSize: 16 }}>{prod.category}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Description</div>
              <div style={{ fontSize: 15, color: '#374151' }}>{prod.description}</div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Price</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>₹{priceDisplay}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Stock</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{prod.stock}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
