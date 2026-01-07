"use client"

import React, { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from 'recharts'

export default function AdminMetrics() {
  const [stockItems, setStockItems] = useState<Array<any>>([])
  const [salesSeries, setSalesSeries] = useState<Array<any>>([])
  const [productBreakdown, setProductBreakdown] = useState<Array<any>>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<any>>([])
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [totalUnits, setTotalUnits] = useState<number>(0)
  const [averageRevenue, setAverageRevenue] = useState<number>(0)
  const [topProducts, setTopProducts] = useState<Array<any>>([])
  const [zeroRevenueProducts, setZeroRevenueProducts] = useState<Array<any>>([])

  const defaultEnd = new Date()
  const defaultStart = new Date(Date.now() - 1000 * 60 * 60 * 24 * 29)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState<string>(fmt(defaultStart))
  const [endDate, setEndDate] = useState<string>(fmt(defaultEnd))
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const rt = await fetch('/api/admin/metrics/stock', { cache: 'no-store', credentials: 'include' })
        const dt = await rt.json().catch(() => null)
        if (!mounted) return
        if (dt?.success) {
          setStockItems(Array.isArray(dt.items) ? dt.items : [])
        } else {
          setStockItems([])
        }
      } catch (err) {
        if (!mounted) return
        setStockItems([])
      }
    })()
    return () => { mounted = false }
  }, [])

  async function loadSales() {
    const params = new URLSearchParams()
    params.set('start', startDate)
    params.set('end', endDate)
    if (selectedProduct) params.set('product', selectedProduct)
    if (selectedCategory) params.set('category', selectedCategory)

    const rt = await fetch('/api/admin/metrics/sales?' + params.toString(), { cache: 'no-store', credentials: 'include' })
    const dt = await rt.json().catch(() => null)
    if (dt?.success) {
      setSalesSeries(Array.isArray(dt.timeSeries) ? dt.timeSeries : [])
      setProductBreakdown(Array.isArray(dt.products) ? dt.products : [])
      setCategoryBreakdown(Array.isArray(dt.categoryBreakdown) ? dt.categoryBreakdown : [])
      setTotalRevenue(Number(dt.totalRevenue ?? 0))
      setTotalUnits(Number(dt.totalUnits ?? 0))
      // Temporary debug log to confirm DB values flow to the UI
      console.log('Metrics API response:', { totalRevenue: dt.totalRevenue, totalUnits: dt.totalUnits, sampleProduct: (dt.products || [])[0] })
      // Compute additional revenue metrics from product list
      // Average revenue = totalRevenue / totalProducts
      const products = Array.isArray(dt.products) ? dt.products : []
      const totalProducts = products.length
      setAverageRevenue(totalProducts > 0 ? Number((Number(dt.totalRevenue ?? 0) / totalProducts).toFixed(2)) : 0)
      // Top N products by revenue
      // Top products sorted by revenue (descending)
      const top = products.slice().sort((a: any, b: any) => (b.revenue ?? 0) - (a.revenue ?? 0)).slice(0, 10)
      setTopProducts(top)
      // Zero-revenue products
      // Zero-revenue products are those with salesCount == 0 (revenue === 0)
      setZeroRevenueProducts(products.filter((p: any) => Number(p.revenue ?? 0) === 0))
    } else {
      setSalesSeries([])
      setProductBreakdown([])
      setCategoryBreakdown([])
      setTotalRevenue(0)
      setTotalUnits(0)
    }
  }

  useEffect(() => { loadSales() }, [])

  const totalProducts = useMemo(() => stockItems.length, [stockItems])
  const totalStock = useMemo(() => stockItems.reduce((s, p) => s + (p.stockRemaining ?? 0), 0), [stockItems])
  const lowStockItems = useMemo(() => stockItems.filter((s: any) => s.lowStock), [stockItems])

  const stockChartData = useMemo(() => stockItems.map((s: any) => ({ name: s.name || s.id, stock: s.stockRemaining || 0 })), [stockItems])

  const productsOptions = useMemo(() => stockItems.map(s => ({ id: s.id, name: s.name })), [stockItems])
  const categoriesOptions = useMemo(() => Array.from(new Set(stockItems.map(s => s.category || 'uncategorized'))), [stockItems])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Admin Metrics</h2>
          <div className="text-sm text-gray-500 mt-1">Revenue derived from `salesCount * price` (deterministic)</div>
        </div>
        <div className="text-sm text-gray-600">Inventory is source of truth — metrics reflect stored salesCount</div>
      </div>

      {/* Metrics Summary Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">Total Products</div>
          <div className="text-2xl font-semibold">{totalProducts}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total Stock Remaining</div>
          <div className="text-2xl font-semibold">{totalStock}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Products Low On Stock</div>
          <div className="text-lg font-medium text-red-600">{lowStockItems.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total Revenue ({startDate} → {endDate})</div>
          <div className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Units: {totalUnits}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Average Revenue / Product</div>
          <div className="text-2xl font-semibold">${averageRevenue.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Top Products (by Revenue)</div>
          <div className="text-sm mt-2">
            {topProducts.length === 0 ? <div className="text-sm text-gray-500">No products</div> : (
              <ol className="text-sm space-y-1">
                {topProducts.map((p: any) => (
                  <li key={p.productId} className={p.revenue === 0 ? 'text-red-600' : 'text-gray-800'}>
                    {p.name} — ${Number(p.revenue ?? 0).toFixed(2)} ({p.units} units)
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Zero-Revenue Products</div>
          <div className="text-sm mt-2">
            {zeroRevenueProducts.length === 0 ? <div className="text-sm text-gray-500">None</div> : (
              <ul className="text-sm space-y-1">
                {zeroRevenueProducts.map((p: any) => (
                  <li key={p.productId} className="text-red-700">{p.name} — {p.salesCount ?? 0} units</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label htmlFor="start-date" className="form-label">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="form-label">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="filter-product" className="form-label">
              Product
            </label>
            <select
              id="filter-product"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="form-input"
            >
              <option value="">All products</option>
              {productsOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filter-category" className="form-label">
              Category
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">All categories</option>
              {categoriesOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <button
              onClick={() => loadSales()}
              className="btn btn-primary w-full px-4 py-2.5 text-base"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Charts & Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-medium mb-2">Sales Trend</h3>
            <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={salesSeries} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[0, 'auto']}
                  label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    if (name === 'totalRevenue') return [`$${Number(value).toFixed(2)}`, 'Revenue']
                    if (name === 'totalUnits') return [value, 'Units']
                    return [value, name]
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stroke="#2563EB" 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                  name="Revenue"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalUnits" 
                  stroke="#10B981" 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                  name="Units"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-2">Product Revenue Breakdown</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={productBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={(value: any, name: any) => [value, name === 'revenue' ? 'Revenue' : 'Units']} />
                <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue">
                  {productBreakdown.map((s, idx) => (
                    <Cell key={s.productId} fill={s.revenue === 0 ? '#b91c1c' : '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Products</h4>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Name</th>
                    <th>Price</th>
                    <th>Units</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productBreakdown.map((p: any) => (
                    <tr key={p.productId} className={p.revenue === 0 ? 'text-red-700' : p.revenue > (totalRevenue * 0.1) ? 'text-green-700' : ''}>
                      <td>{p.name}</td>
                      <td>${Number(p.price ?? 0).toFixed(2)}</td>
                      <td>{p.units}</td>
                      <td>${Number(p.revenue ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="card">
        <h3 className="text-md font-medium mb-2">Low stock / Alerts</h3>
        {lowStockItems.length === 0 ? (
          <div className="text-sm text-gray-500">No low-stock products</div>
        ) : (
          <ul className="text-sm mt-2 space-y-1">
            {lowStockItems.map((i: any) => (
              <li key={i.id} className={i.stockRemaining === 0 ? 'text-red-700' : 'text-yellow-700'}>
                {i.name || i.id} — {i.stockRemaining} units — threshold: {i.lowStockThreshold ?? 10}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
