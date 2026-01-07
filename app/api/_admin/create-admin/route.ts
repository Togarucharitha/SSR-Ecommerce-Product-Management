import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'
import { z } from 'zod'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * Create a new admin (admin-only endpoint)
 * POST /api/_admin/create-admin
 * 
 * BOOTSTRAP MODE: If no admin exists in the database, this endpoint allows
 * creating the first admin without authentication. This is a one-time
 * bootstrap mechanism for initial production deployment.
 * 
 * Once at least one admin exists, all subsequent admin creation requests
 * require valid admin authentication.
 */
export async function POST(req: NextRequest) {
  const prisma = getPrisma()

  // BOOTSTRAP CHECK: Check if any admin user already exists in the database
  // This determines whether we're in bootstrap mode (first admin) or normal mode (requires auth)
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  })

  const isBootstrapMode = !existingAdmin

  // If admin exists, enforce authentication (normal mode)
  // If no admin exists, skip auth check (bootstrap mode - one-time only)
  if (!isBootstrapMode) {
    const authResult = await requireAdmin(req)
    if (authResult.error || !authResult.user) {
      return authResult.user === null && authResult.error?.includes('Admin')
        ? forbiddenResponse()
        : unauthorizedResponse(authResult.error || 'Authentication required')
    }
  }

  try {
    const body = await req.json()
    const data = createAdminSchema.parse(body)

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, message: 'Admin created successfully', user })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 })
    }

    console.error('Error creating admin:', error)
    return NextResponse.json({ success: false, error: 'Failed to create admin' }, { status: 500 })
  }
}


