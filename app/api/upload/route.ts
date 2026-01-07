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
    const form = await req.formData()
    const fileEntries = form.getAll('files') as File[]
    if (!fileEntries || fileEntries.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const urls: string[] = []
    for (const f of fileEntries) {
      const buf = Buffer.from(await f.arrayBuffer())
      const url = await uploadImage(buf)
      urls.push(url)
    }

    return NextResponse.json({ success: true, urls })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Upload failed' }, { status: 500 })
  }
}
