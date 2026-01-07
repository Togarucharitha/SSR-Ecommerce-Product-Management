import dynamic from 'next/dynamic'

const ProductCreateForm = dynamic(() => import('@/components/ProductCreateForm'), { ssr: false })

export default function CreateProductPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Create Product</h1>
        <ProductCreateForm />
      </div>
    </main>
  )
}
