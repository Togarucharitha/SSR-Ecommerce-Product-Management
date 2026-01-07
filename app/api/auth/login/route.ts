import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    // Safely parse JSON body and provide clearer errors when parsing fails
    const rawBody = await req.text()
    let body: any
    try {
      body = rawBody ? JSON.parse(rawBody) : {}
    } catch (parseErr: any) {
      console.error('[login] Failed to parse JSON body:', parseErr?.message, 'rawBody:', rawBody)
      return NextResponse.json({ success: false, error: 'Invalid JSON body', details: parseErr?.message || String(parseErr), rawBody: rawBody?.slice(0, 100) }, { status: 400 })
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const prisma = getPrisma()

    // FIND USER
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    // User not found
    if (!user) {
      console.warn('[login] Login failed - user not found:', normalizedEmail)
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }

    // PASSWORD CHECK (supports legacy plaintext passwords)
    let isPasswordValid = false

    // Normal bcrypt compare
    try {
      isPasswordValid = await comparePassword(password, user.password)
    } catch (e) {
      isPasswordValid = false
    }

    // If bcrypt compare failed and stored password appears to be plaintext, allow migration
    if (!isPasswordValid && user.password === password) {
      // Legacy plaintext match - consider valid and migrate to hashed password
      isPasswordValid = true
      try {
        const newHash = await bcrypt.hash(password, 10)
        await prisma.user.update({ where: { id: user.id }, data: { password: newHash } })
        console.info('[login] Migrated plaintext password to bcrypt for:', normalizedEmail)
      } catch (e) {
        console.error('[login] Failed to migrate plaintext password for:', normalizedEmail, e)
      }
    }

    if (!isPasswordValid) {
      console.warn('[login] Login failed - invalid password for:', normalizedEmail)
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }

    // JWT GENERATION and cookie set - add granular logging for debugging
    try {
      console.info('[login] Generating token for:', normalizedEmail)
      const token = generateToken({ userId: user.id, email: user.email, role: user.role as 'admin' | 'user' })

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      })

      try {
        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
      } catch (cookieErr) {
        console.error('[login] Failed to set auth cookie:', cookieErr)
        // continue and return response (token still generated)
      }

      console.info('[login] Login successful for:', normalizedEmail)
      return response
    } catch (tokenErr: any) {
      console.error('[login] Token generation error:', tokenErr?.message || tokenErr)
      throw tokenErr
    }
  } catch (error: any) {
    console.error('Login error:', error)
    // In development return the error message to aid debugging (do not enable in production)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { success: false, error: 'Login failed', details: error?.message || String(error) },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
