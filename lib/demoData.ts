// Demo/seeded data for metrics — realistic-looking, non-production
// Contains `sales` array and `stock` array. Use for demonstration or local dev only.

type Sale = {
  date: string // ISO yyyy-mm-dd
  productId: string
  productName: string
  category: string
  unitsSold: number
  revenue: number
}

type Stock = {
  productId: string
  currentStock: number
  lowStockThreshold: number
  lastUpdated: string
}

const PRODUCTS = [
  { id: 'p-el-001', name: 'Wireless Headphones', category: 'Electronics', price: 79.99 },
  { id: 'p-hm-001', name: 'Ceramic Mug', category: 'Home', price: 12.5 },
  { id: 'p-cl-001', name: 'Cotton T-Shirt', category: 'Clothing', price: 19.0 },
  { id: 'p-gr-001', name: 'Organic Granola', category: 'Grocery', price: 6.75 },
  { id: 'p-ty-001', name: 'Building Blocks Set', category: 'Toys', price: 29.99 },
  { id: 'p-sp-001', name: 'Yoga Mat', category: 'Sports', price: 34.5 },
]

// Export a demoProducts array that mimics the DB product shape used by the dashboard
export const demoProducts = PRODUCTS.map((p, idx) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  stock: Math.max(0, Math.round((p.price % 10) * 10 + (Math.random() * 30))),
  images: [],
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 120)).toISOString(),
}))

// Build ~90 days of sales with realistic daily variation and occasional stockouts
function buildSales(days = 90): Sale[] {
  const out: Sale[] = []
  const today = new Date()
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    day.setUTCDate(day.getUTCDate() - d)
    const date = day.toISOString().slice(0, 10)

    PRODUCTS.forEach((p, idx) => {
      // base demand by category/product
      const base = [8, 4, 12, 6, 3, 5][idx] || 4
      // weekday effect: weekends (Sat,Sun) often see more purchases for some categories
      const weekday = day.getUTCDay()
      const weekendBoost = (weekday === 0 || weekday === 6) ? (p.category === 'Toys' || p.category === 'Home' ? 1.4 : 1.1) : 1
      // seasonal/weekly ripple
      const noise = Math.max(0, Math.round(base * (0.6 + Math.random() * 1.2) * weekendBoost))

      // occasional promo spikes: ~3% of days
      const promo = Math.random() < 0.03 ? Math.round(noise * (1.5 + Math.random() * 2)) : 0

      // occasional zero-sales day simulating stockout (rare)
      const stockout = Math.random() < 0.01 ? 0 : noise + promo

      const unitsSold = stockout
      const revenue = Math.round(unitsSold * p.price * 100) / 100

      out.push({ date, productId: p.id, productName: p.name, category: p.category, unitsSold, revenue })
    })
  }

  return out
}

// Build stock snapshot with some low stock and some stockouts
function buildStock(): Stock[] {
  const list: Stock[] = PRODUCTS.map((p, idx) => {
    // vary current stock, some near threshold, one or two stockouts
    const threshold = [10, 6, 8, 4, 5, 7][idx] || 5
    let current = Math.max(0, Math.round(threshold * (1 + Math.random() * 8) - Math.random() * 6))
    // create a couple of low-stock items
    if (Math.random() < 0.2) current = Math.floor(Math.random() * (threshold + 2))
    // create occasional stockouts
    if (Math.random() < 0.05) current = 0

    return {
      productId: p.id,
      currentStock: current,
      lowStockThreshold: threshold,
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)).toISOString(),
    }
  })
  return list
}

export const demoSales: Sale[] = buildSales(90)
export const demoStock: Stock[] = buildStock()

export type { Sale, Stock }

export const DEMO_NOTICE = 'This data is seeded demo data — not production.'
