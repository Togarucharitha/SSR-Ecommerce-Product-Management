import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// JWT secret - must be accessible in Edge runtime
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
}

/**
 * Verify JWT token in middleware (Edge runtime compatible using jose)
 */
async function verifyTokenInMiddleware(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    // Extract our custom payload fields
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'user',
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Middleware verifyToken] Failed:', {
        error: error?.message,
        name: error?.name,
        code: error?.code,
        tokenLength: token?.length,
        jwtSecretLength: JWT_SECRET?.length,
        jwtSecretSet: !!JWT_SECRET && JWT_SECRET !== 'your-secret-key-change-in-production',
      })
    }
    return null
  }
}

/**
 * Middleware to protect admin routes
 * Runs on every request
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin/dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Checking dashboard access for:', pathname)
      console.log('[Middleware] Token present:', !!token)
      if (token) {
        console.log('[Middleware] Token length:', token.length)
      }
    }

    if (!token) {
      // Redirect to login if no token
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] No token found, redirecting to login')
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token (using middleware-compatible function)
    const payload = await verifyTokenInMiddleware(token)

    if (!payload) {
      // Invalid token - clear cookie and redirect
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Token verification failed')
      }
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }

    // Check if user is admin for dashboard access
    if (payload.role !== 'admin') {
      // Non-admin trying to access dashboard
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] User is not admin, role:', payload.role)
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Token is valid and user is admin - allow access
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Access granted for admin user:', payload.email)
    }
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
  ],
}

