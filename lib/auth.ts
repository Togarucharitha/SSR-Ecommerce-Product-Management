import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
// Note: `getPrisma` is dynamically imported inside functions to avoid circular imports at module initialization
import { Prisma } from '@prisma/client'

// JWT secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Default admin credentials (can be overridden via env)
const DEFAULT_ADMIN_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim()
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Administrator'

export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 10
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return (jwt as any).sign(payload as any, JWT_SECRET as any, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = (jwt as any).verify(token, JWT_SECRET as any) as JWTPayload
    return decoded
  } catch (error: any) {
    // Enhanced error logging for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[verifyToken] Token verification failed:', {
        error: error?.message,
        name: error?.name,
        tokenLength: token?.length,
        jwtSecretLength: JWT_SECRET?.length,
        jwtSecretSet: !!JWT_SECRET && JWT_SECRET !== 'your-secret-key-change-in-production',
      })
    }
    return null
  }
}

/**
 * Get user from token (verifies token and fetches user from database)
 */
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const { getPrisma } = await import('./prisma')
  const prisma = getPrisma()

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  return user
}

/**
 * Check if user is admin
 */
export function isAdmin(role: string): boolean {
  return role === 'admin'
}

/**
 * Create the default admin user if no admin exists.
 * This function is idempotent: if an admin exists or the default
 * admin already exists, it will not create a duplicate.
 */
export async function createDefaultAdminIfMissing(): Promise<void> {
  try {
    const { getPrisma } = await import('./prisma')
    const prisma = getPrisma()

    // Quick check: is there already any admin?
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true, email: true } })
    if (existingAdmin) {
      console.info('[createDefaultAdminIfMissing] Admin already exists:', existingAdmin.email)
      return
    }

    // Attempt to create default admin. Use the DEFAULT_ADMIN_EMAIL as unique key.
    const hashed = await hashPassword(DEFAULT_ADMIN_PASSWORD)

    try {
      const user = await prisma.user.create({
        data: {
          name: DEFAULT_ADMIN_NAME,
          email: DEFAULT_ADMIN_EMAIL,
          password: hashed,
          role: 'admin',
        },
        select: { id: true, email: true },
      })

      console.info('[createDefaultAdminIfMissing] Default admin created:', user.email)
    } catch (err: any) {
      // Handle unique constraint race condition: another process created the admin
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        console.warn('[createDefaultAdminIfMissing] Default admin already created by another process')
        return
      }

      throw err
    }
  } catch (error) {
    console.error('[createDefaultAdminIfMissing] Error ensuring default admin:', error)
  }
}

