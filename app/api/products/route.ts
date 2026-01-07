import { NextRequest, NextResponse } from 'next/server'
import { createProduct } from '@/app/actions/products'
import { uploadImage } from '@/lib/cloudinary'
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
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

    // Handle multipart/form-data with files
    // Browser automatically sets Content-Type with boundary when using FormData
    const isFormData = contentType.includes('multipart/form-data')
    const isJson = contentType.includes('application/json')
    
    if (isFormData) {
      const form = await req.formData()
      const name = form.get('name') as string | null
      const description = form.get('description') as string | null
      const price = form.get('price') as string | null
      const stock = form.get('stock') as string | null
      const salesCount = form.get('salesCount') as string | null
      const category = form.get('category') as string | null

      payload.name = name ?? undefined
      payload.description = description ?? undefined
      if (price !== null && price !== '') payload.price = Number(price)
      if (stock !== null && stock !== '') payload.stock = Number(stock)
      if (salesCount !== null && salesCount !== '') payload.salesCount = Number(salesCount)
      payload.category = category ?? undefined

      const files = form.getAll('images') as any[]
      const imageUrls: string[] = []
      for (const f of files) {
        if (!f) continue
        // If form value is a string (e.g., pasted URL), accept it
        if (typeof f === 'string') {
          if (f.trim()) imageUrls.push(f.trim())
          continue
        }
        // Otherwise it's a File, convert to buffer
        try {
          const buf = Buffer.from(await f.arrayBuffer())
          const url = await uploadImage(buf)
          imageUrls.push(url)
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError)
          // Continue with other images even if one fails
        }
      }

      // If no images uploaded, set empty array (validation will handle this)
      payload.images = imageUrls.length > 0 ? imageUrls : []
    } else if (isJson) {
      // JSON body
      const body = await req.json()
      payload = body
      // Ensure images is always an array
      if (!payload.images) {
        payload.images = []
      }
    } else {
      // Unknown content type - try FormData as default (most common for file uploads)
      console.warn('Unknown content-type, attempting FormData parsing:', contentType)
      const form = await req.formData()
      const name = form.get('name') as string | null
      const description = form.get('description') as string | null
      const price = form.get('price') as string | null
      const stock = form.get('stock') as string | null
      const category = form.get('category') as string | null

      payload.name = name ?? undefined
      payload.description = description ?? undefined
      if (price !== null && price !== '') payload.price = Number(price)
      if (stock !== null && stock !== '') payload.stock = Number(stock)
      payload.category = category ?? undefined

      const files = form.getAll('images') as any[]
      const imageUrls: string[] = []
      for (const f of files) {
        if (!f) continue
        if (typeof f === 'string') {
          if (f.trim()) imageUrls.push(f.trim())
          continue
        }
        try {
          const buf = Buffer.from(await f.arrayBuffer())
          const url = await uploadImage(buf)
          imageUrls.push(url)
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError)
        }
      }
      payload.images = imageUrls.length > 0 ? imageUrls : []
    }

    // Ensure salesCount is a number and default to 0 when not provided.
    payload.salesCount = Number(payload.salesCount ?? 0)
    // Log full payload for debugging (temporary): confirms salesCount flows through
    console.log('Creating product with payload:', { ...payload, images: payload.images?.length || 0 })

    const res = await createProduct(payload)
    if (res?.success) {
      return NextResponse.json(res)
    }
    console.error('Product creation failed:', res)
    return NextResponse.json(res, { status: 400 })
  } catch (error: any) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to create product',
      details: error?.stack 
    }, { status: 500 })
  }
}
