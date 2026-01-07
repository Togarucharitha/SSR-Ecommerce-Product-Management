import dynamic from 'next/dynamic'
import { getProduct } from '@/app/actions/products'

export const dynamic = 'force-dynamic'

const ProductEditForm = dynamic(() => import('@/components/ProductEditForm'), { ssr: false })
const DeleteProductButton = dynamic(() => import('@/components/DeleteProductButton'), { ssr: false })

export default async function EditPage({ params }: { params: { id: string } }) {
  const res = await getProduct(params.id)

  if (!res?.success) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
          <div className="p-4 bg-white rounded shadow">Failed to load product: {res?.error ?? 'Unknown'}</div>
        </div>
      </main>
    )
  }

  const product = res.data

  if (!product) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
          <div className="p-4 bg-white rounded shadow">Product not found.</div>
        </div>
      </main>
    )
  }

  const initial = {
    name: product.name,
    description: product.description,
    price: typeof product.price === 'object' ? Number((product as any).price) : Number(product.price),
    stock: product.stock,
    salesCount: product.salesCount ?? 0,
    category: product.category,
    images: product.images ?? [],
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-600">Update product information and settings</p>
        </div>
        <ProductEditForm id={product.id} initial={initial} />
        <div className="mt-8 pt-6 border-t">
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-700">
                  Once you delete a product, there is no going back. Please be certain.
                </p>
              </div>
              <DeleteProductButton id={product.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
