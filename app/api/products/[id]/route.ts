import { NextRequest, NextResponse } from 'next/server'
import { updateProduct, deleteProduct } from '@/app/actions/products'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { getPrisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Require admin authentication
    let authResult: any
    try {
      authResult = await requireAdmin(req)
    } catch (authError: any) {
      console.error('[PUT /api/products/[id]] Auth middleware error:', authError)
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          details: authError?.message || 'Unexpected auth error',
        },
        { status: 500 }
      )
    }

    if (authResult.error || !authResult.user) {
      return authResult.user === null && authResult.error?.includes('Admin')
        ? forbiddenResponse()
        : unauthorizedResponse(authResult.error || 'Authentication required')
    }

    // Validate Cloudinary environment variables early
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables')
      return NextResponse.json(
        { success: false, error: 'Image upload service not configured. Contact administrator.' },
        { status: 500 }
      )
    }

    const contentType = req.headers.get('content-type') || ''
    console.log(`[PUT /api/products/[id]] Content-Type: ${contentType}`)

    let payload: any = {}

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload + fields
      try {
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
          try {
            const prisma = getPrisma()
            const existing = await prisma.product.findUnique({ where: { id: params.id } })
            if (existing && existing.images && existing.images.length) {
              try {
                await Promise.all(existing.images.map((u: string) => deleteImage(u)))
              } catch (e) {
                console.error('Failed to delete old images', e)
              }
            }
          } catch (dbError: any) {
            console.error('Error fetching existing product:', dbError)
            // Continue even if we can't fetch existing - images will be replaced
          }

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
              // If image upload fails, return error immediately with details
              return NextResponse.json(
                {
                  success: false,
                  error: 'Failed to upload image. Please try again.',
                  details: uploadError?.message || 'Unknown upload error',
                },
                { status: 500 }
              )
            }
          }

          payload.images = imageUrls
        }
      } catch (formError: any) {
        console.error('[PUT /api/products/[id]] FormData parsing error:', formError)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse form data. Please try again.',
            details: formError?.message || 'FormData parsing failed',
          },
          { status: 400 }
        )
      }
    } else if (contentType.includes('application/json')) {
      // Handle JSON body
      try {
        const body = await req.json()
        payload = body
      } catch (jsonError: any) {
        console.error('[PUT /api/products/[id]] JSON parsing error:', jsonError)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse JSON. Please try again.',
            details: jsonError?.message || 'JSON parsing failed',
          },
          { status: 400 }
        )
      }
    } else {
      // Unknown content type - try FormData as fallback
      console.warn('Unknown content-type, attempting FormData parsing:', contentType)
      try {
        const form = await req.formData()
        const name = form.get('name') as string | null
        const description = form.get('description') as string | null
        const price = form.get('price') as string | null
        const stock = form.get('stock') as string | null
        const category = form.get('category') as string | null

        if (name !== null) payload.name = name
        if (description !== null) payload.description = description
        if (price !== null) payload.price = Number(price)
        if (stock !== null) payload.stock = Number(stock)
        if (category !== null) payload.category = category

        const files = form.getAll('images') as any[]

        if (files && files.length > 0) {
          try {
            const prisma = getPrisma()
            const existing = await prisma.product.findUnique({ where: { id: params.id } })
            if (existing && existing.images && existing.images.length) {
              try {
                await Promise.all(existing.images.map((u: string) => deleteImage(u)))
              } catch (e) {
                console.error('Failed to delete old images', e)
              }
            }
          } catch (dbError: any) {
            console.error('Error fetching existing product:', dbError)
          }

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
              return NextResponse.json(
                {
                  success: false,
                  error: 'Failed to upload image. Please try again.',
                  details: uploadError?.message || 'Unknown upload error',
                },
                { status: 500 }
              )
            }
          }

          payload.images = imageUrls
        }
      } catch (fallbackError: any) {
        console.error('[PUT /api/products/[id]] Fallback FormData parsing error:', fallbackError)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse request. Please try again.',
            details: fallbackError?.message || 'Request parsing failed',
          },
          { status: 400 }
        )
      }
    }

    console.log('[PUT /api/products/[id]] Payload ready for processing:', {
      name: payload.name,
      description: payload.description ? payload.description.substring(0, 50) : 'N/A',
      price: payload.price,
      stock: payload.stock,
      category: payload.category,
      imageCount: payload.images?.length || 0,
    })

    const res = await updateProduct(params.id, payload)
    if (res?.success) {
      console.log('[PUT /api/products/[id]] Product updated successfully')
      return NextResponse.json(res)
    }
    console.error('[PUT /api/products/[id]] Product update failed:', res)
    return NextResponse.json(res, { status: 400 })
  } catch (error: any) {
    console.error('[PUT /api/products/[id]] Unexpected error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    })
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to update product',
        details: error?.stack || 'No additional details',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Require admin authentication
    let authResult: any
    try {
      authResult = await requireAdmin(req)
    } catch (authError: any) {
      console.error('[DELETE /api/products/[id]] Auth middleware error:', authError)
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          details: authError?.message || 'Unexpected auth error',
        },
        { status: 500 }
      )
    }

    if (authResult.error || !authResult.user) {
      return authResult.user === null && authResult.error?.includes('Admin')
        ? forbiddenResponse()
        : unauthorizedResponse(authResult.error || 'Authentication required')
    }

    const res = await deleteProduct(params.id)
    if (res?.success) {
      console.log('[DELETE /api/products/[id]] Product deleted successfully')
      return NextResponse.json(res)
    }
    console.error('[DELETE /api/products/[id]] Product deletion failed:', res)
    return NextResponse.json(res, { status: 400 })
  } catch (error: any) {
    console.error('[DELETE /api/products/[id]] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to delete product',
        details: error?.stack || 'No additional details',
      },
      { status: 500 }
    )
  }
}
