import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getPrisma } from './prisma'

// JWT secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
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

