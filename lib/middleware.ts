import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserFromToken } from './auth'

/**
 * Middleware to verify JWT token from HTTP-only cookie
 */
export async function verifyAuth(req: NextRequest): Promise<{ user: any; error: null } | { user: null; error: string }> {
  try {
    // Get token from HTTP-only cookie
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return { user: null, error: 'No authentication token provided' }
    }

    // Verify token and get user
    const user = await getUserFromToken(token)

    if (!user) {
      return { user: null, error: 'Invalid or expired token' }
    }

    return { user, error: null }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(req: NextRequest): Promise<{ user: any; error: null } | { user: null; error: string }> {
  const authResult = await verifyAuth(req)

  if (authResult.error || !authResult.user) {
    return { user: null, error: authResult.error || 'Authentication required' }
  }

  if (authResult.user.role !== 'admin') {
    return { user: null, error: 'Admin access required' }
  }

  return { user: authResult.user, error: null }
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  )
}

/**
 * Helper to create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden - Admin access required') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  )
}

