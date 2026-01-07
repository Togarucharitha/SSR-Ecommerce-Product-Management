import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function listDatesBetween(start: Date, end: Date) {
  const dates: string[] = []
  const d = new Date(start)
  while (d <= end) {
    dates.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function daysBetweenInclusive(a: Date, b: Date) {
  const msPerDay = 1000 * 60 * 60 * 24
  const start = new Date(a)
  const end = new Date(b)
  start.setUTCHours(0, 0, 0, 0)
  end.setUTCHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1)
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req)
  if (authResult.error || !authResult.user) {
    return authResult.user === null && authResult.error?.includes('Admin')
      ? forbiddenResponse()
      : unauthorizedResponse(authResult.error || 'Authentication required')
  }

  try {
    const url = new URL(req.url)
    const startParam = url.searchParams.get('start')
    const endParam = url.searchParams.get('end')
    const productFilter = url.searchParams.get('product') || undefined
    const categoryFilter = url.searchParams.get('category') || undefined

    const end = endParam ? new Date(endParam) : new Date()
    const start = startParam ? new Date(startParam) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 29)

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return NextResponse.json({ success: false, error: 'Invalid date range' }, { status: 400 })
    }


    // For authoritative revenue metrics we derive everything directly from
    // stored product fields: `salesCount` and `price`. We do NOT simulate or
    // distribute sales over time because there is no orders table with per-sale
    // timestamps in this schema. The database is the single source of truth.
    const dbProducts = await prisma.product.findMany({ select: { id: true, name: true, category: true, price: true, stock: true, salesCount: true, createdAt: true } })

    const filtered = dbProducts.filter(p => {
      if (productFilter && p.id !== productFilter && p.name !== productFilter) return false
      if (categoryFilter && (p.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false
      return true
    })

    // Compute per-product revenue strictly as `salesCount * price`.
    // Stock is used only for inventory metrics elsewhere.
    const perProduct = filtered.map(p => {
      const price = Number((p as any).price)
      const units = Number((p as any).salesCount)
      const revenue = Math.round((units * price) * 100) / 100
      return { productId: p.id, name: p.name, category: p.category, units, revenue, price, salesCount: units }
    })

    // Aggregations
    const totalUnits = perProduct.reduce((s, x) => s + Number(x.units), 0)
    const totalRevenue = perProduct.reduce((s, x) => s + Number(x.revenue), 0)
    const categoryAgg = new Map<string, { revenue: number; units: number }>()
    for (const p of perProduct) {
      const cat = p.category || 'uncategorized'
      const entry = categoryAgg.get(cat) || { revenue: 0, units: 0 }
      entry.revenue += p.revenue
      entry.units += p.units
      categoryAgg.set(cat, entry)
    }

    const categoryBreakdown = Array.from(categoryAgg.entries()).map(([category, v]) => ({ category, revenue: Math.round(v.revenue * 100) / 100, units: v.units }))

    // Top products by revenue
    const topProducts = perProduct.slice().sort((a, b) => b.revenue - a.revenue)
    const zeroRevenueProducts = perProduct.filter(p => p.revenue === 0)

    // Bucket data by day: group products by their createdAt date
    const dayBuckets = new Map<string, { revenue: number; units: number }>()
    
    // Initialize all days in range with zero values
    const allDates = listDatesBetween(start, end)
    for (const dateStr of allDates) {
      dayBuckets.set(dateStr, { revenue: 0, units: 0 })
    }
    
    // Create a map of product ID to revenue/units data for quick lookup
    const productDataMap = new Map<string, { revenue: number; units: number }>()
    for (const p of perProduct) {
      productDataMap.set(p.productId, { revenue: p.revenue, units: p.units })
    }
    
    // Aggregate products by their creation date
    for (const p of filtered) {
      const productDate = new Date(p.createdAt)
      const dateStr = productDate.toISOString().slice(0, 10)
      
      // Only include products within the date range
      if (dateStr >= start.toISOString().slice(0, 10) && dateStr <= end.toISOString().slice(0, 10)) {
        const productData = productDataMap.get(p.id)
        if (productData) {
          const bucket = dayBuckets.get(dateStr) || { revenue: 0, units: 0 }
          bucket.revenue += Number(productData.revenue || 0)
          bucket.units += Number(productData.units || 0)
          dayBuckets.set(dateStr, bucket)
        }
      }
    }
    
    // Convert to array and sort by date
    const timeSeries = Array.from(dayBuckets.entries())
      .map(([date, data]) => ({
        date,
        totalRevenue: Math.round(data.revenue * 100) / 100,
        totalUnits: data.units
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log('Sales metrics computed from DB products:', { totalUnits, totalRevenue, productsCount: perProduct.length })

    return NextResponse.json({ success: true, timeSeries, products: perProduct, totalRevenue: Math.round(totalRevenue * 100) / 100, totalUnits, categoryBreakdown, topProducts, zeroRevenueProducts, note: 'Metrics computed from Product.salesCount and price' })
  } catch (error: any) {
    console.error('Metrics sales error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sales metrics' }, { status: 500 })
  }
}

