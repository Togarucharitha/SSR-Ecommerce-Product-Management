import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

// 🔥 BOOTSTRAP ADMIN CONSTANTS (TEMPORARY)
const BOOTSTRAP_ADMIN_EMAIL = 'admin@yourapp.com'
const BOOTSTRAP_ADMIN_PASSWORD = 'admin123'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const prisma = getPrisma()

    // 🔥 FIND USER
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // 🔥 BOOTSTRAP ADMIN LOGIN (BYPASS)
    if (
      normalizedEmail === BOOTSTRAP_ADMIN_EMAIL &&
      password === BOOTSTRAP_ADMIN_PASSWORD &&
      user
    ) {
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: 'admin', // FORCE ADMIN
      })

      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'admin',
        },
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    // ❌ Normal user not found
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 🔐 NORMAL PASSWORD CHECK
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 🔑 NORMAL JWT GENERATION
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'user',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
