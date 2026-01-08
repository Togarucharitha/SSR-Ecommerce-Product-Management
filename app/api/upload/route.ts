import { NextRequest, NextResponse } from 'next/server'
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
    // Validate Cloudinary environment variables early
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables')
      return NextResponse.json(
        { success: false, error: 'Image upload service not configured. Contact administrator.' },
        { status: 500 }
      )
    }

    const form = await req.formData()
    const fileEntries = form.getAll('files') as File[]
    if (!fileEntries || fileEntries.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const urls: string[] = []
    for (const f of fileEntries) {
      try {
        const buf = Buffer.from(await f.arrayBuffer())
        const url = await uploadImage(buf)
        urls.push(url)
      } catch (uploadError: any) {
        console.error('Error uploading file:', uploadError)
        return NextResponse.json(
          { success: false, error: 'Failed to upload file. Please try again.', details: uploadError?.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, urls })
  } catch (error: any) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Upload failed', details: error?.stack },
      { status: 500 }
    )
  }
}
