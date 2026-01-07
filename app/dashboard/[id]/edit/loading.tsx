export default function EditProductLoading() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>

        {/* Form skeleton */}
        <div className="card">
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Description field */}
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Price and Stock fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Category field */}
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Images field */}
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Submit button */}
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Delete button skeleton */}
        <div className="mt-6">
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </main>
  )
}

