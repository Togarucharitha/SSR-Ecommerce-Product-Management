import { NextRequest, NextResponse } from 'next/server'
import { updateProduct, deleteProduct } from '@/app/actions/products'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Require admin authentication
  const authResult = await requireAdmin(req)
  if (authResult.error || !authResult.user) {
    return authResult.user === null && authResult.error?.includes('Admin')
      ? forbiddenResponse()
      : unauthorizedResponse(authResult.error || 'Authentication required')
  }
  try {
    const contentType = req.headers.get('content-type') || ''

    let payload: any = {}

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload + fields
      const form = await req.formData()
      const name = form.get('name') as string | null
      const description = form.get('description') as string | null
      const price = form.get('price') as string | null
      const stock = form.get('stock') as string | null
      const salesCount = form.get('salesCount') as string | null
      const category = form.get('category') as string | null

      if (name !== null) payload.name = name
      if (description !== null) payload.description = description
      if (price !== null) payload.price = Number(price)
      if (stock !== null) payload.stock = Number(stock)
      if (salesCount !== null) payload.salesCount = Number(salesCount)
      if (category !== null) payload.category = category

      const files = form.getAll('images') as any[]

      if (files && files.length > 0) {
        // Fetch existing product to delete old images
        const existing = await prisma.product.findUnique({ where: { id: params.id } })
        if (existing && existing.images && existing.images.length) {
          try {
            await Promise.all(existing.images.map((u: string) => deleteImage(u)))
          } catch (e) {
            console.error('Failed to delete old images', e)
          }
        }

        const imageUrls: string[] = []
        for (const f of files) {
          if (!f) continue
          if (typeof f === 'string') {
            imageUrls.push(f)
            continue
          }
          const buf = Buffer.from(await f.arrayBuffer())
          const url = await uploadImage(buf)
          imageUrls.push(url)
        }

        payload.images = imageUrls
      }
    } else {
      const body = await req.json()
      payload = body
    }

    const res = await updateProduct(params.id, payload)
    if (res?.success) return NextResponse.json(res)
    return NextResponse.json(res, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Require admin authentication
  const authResult = await requireAdmin(req)
  if (authResult.error || !authResult.user) {
    return authResult.user === null && authResult.error?.includes('Admin')
      ? forbiddenResponse()
      : unauthorizedResponse(authResult.error || 'Authentication required')
  }
  try {
    const res = await deleteProduct(params.id)
    if (res?.success) return NextResponse.json(res)
    return NextResponse.json(res, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed' }, { status: 500 })
  }
}
