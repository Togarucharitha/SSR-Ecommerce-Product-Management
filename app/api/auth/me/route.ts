import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware'

/**
 * Get current authenticated user
 */
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)

  if (authResult.error || !authResult.user) {
    return NextResponse.json(
      { success: false, error: authResult.error || 'Not authenticated' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    success: true,
    user: authResult.user,
  })
}

