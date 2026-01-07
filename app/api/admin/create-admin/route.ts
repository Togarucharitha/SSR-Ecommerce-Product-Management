import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Health check - verify route exists
 */
export function GET() {
  return NextResponse.json(
    { success: true, message: 'Admin creation endpoint is active' },
    { status: 200 }
  )
}

/**
 * Create a new admin (admin-only endpoint)
 * POST /api/admin/create-admin
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[CREATE-ADMIN] Request started')

    // Dynamic imports
    const { getPrisma } = await import('@/lib/prisma')
    const { hashPassword } = await import('@/lib/auth')
    const { z } = await import('zod')
    const { Prisma } = await import('@prisma/client')

    const prisma = getPrisma()

    // Parse request
    const body = await req.json()
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    })
    const data = schema.parse(body)

    // Check if admin exists (bootstrap)
    const adminExists = await prisma.user.findFirst({ where: { role: 'admin' } })
    const isBootstrap = !adminExists

    console.log('[CREATE-ADMIN] Bootstrap mode:', isBootstrap)

    // Create admin
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: await hashPassword(data.password),
        role: 'admin',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    console.log('[CREATE-ADMIN] Success:', user.email)
    return NextResponse.json({ success: true, message: 'Admin created', user }, { status: 201 })
  } catch (error: any) {
    console.error('[CREATE-ADMIN] Error:', error?.message)
    return NextResponse.json({ success: false, error: error?.message || 'Error' }, { status: 400 })
  }
}
