import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type ProductItem = {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

/**
 * GET /api/admin/metrics/stock
 * Returns stock and simulated sales-derived metrics using real products as single source of truth.
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req)
  if (authResult.error || !authResult.user) {
    return authResult.user === null && authResult.error?.includes('Admin')
      ? forbiddenResponse()
      : unauthorizedResponse(authResult.error || 'Authentication required')
  }

  try {
    // Fetch all real products from DB (single source of truth)
    const dbProducts = await prisma.product.findMany({ select: { id: true, name: true, price: true, stock: true, category: true, createdAt: true } })

    const items = dbProducts.map(p => {
      const price = Number(p.price ?? 0)
      const stock = Number(p.stock ?? 0)
      const lowThreshold = Math.max(5, Math.floor(stock * 0.2))
      const lowStock = stock <= lowThreshold
      return {
        id: p.id,
        name: p.name,
        category: p.category ?? 'uncategorized',
        stockRemaining: stock,
        // Read salesCount directly from DB without fallback to avoid overriding
        // the stored value (DB is the source of truth).
        salesCount: Number((p as any).salesCount),
        price,
        lowStock,
        lowStockThreshold: lowThreshold,
      }
    })

    const totalStock = items.reduce((s, it) => s + (it.stockRemaining || 0), 0)
    const lowStockCount = items.filter(i => i.lowStock).length

    const categoryMap = new Map<string, { products: number; totalStock: number }>()
    for (const it of items) {
      const cat = it.category || 'uncategorized'
      const prev = categoryMap.get(cat) || { products: 0, totalStock: 0 }
      prev.products += 1
      prev.totalStock += it.stockRemaining
      categoryMap.set(cat, prev)
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, v]) => ({ category, products: v.products, totalStock: v.totalStock }))

    return NextResponse.json({ success: true, totalStock, lowStockCount, categoryBreakdown, items, note: 'Inventory metrics generated from Product records' })
  } catch (error: any) {
    console.error('Metrics stock error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stock metrics' }, { status: 500 })
  }
}
