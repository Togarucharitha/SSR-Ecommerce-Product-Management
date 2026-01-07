export default function ProductDetailLoading() {
  return (
    <main>
      <div className="container">
        {/* Header skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Product card skeleton */}
        <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Image skeleton */}
          <div style={{ width: 360, maxWidth: '40%' }}>
            <div className="w-full h-[280px] bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Details skeleton */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

