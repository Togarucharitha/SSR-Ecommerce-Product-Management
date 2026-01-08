import { PrismaClient } from '@prisma/client'
import { createDefaultAdminIfMissing } from './auth'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

let prisma: PrismaClient | undefined = globalForPrisma.prisma

export function getPrisma() {
  if (!prisma) {
    try {
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        // Optimize for Neon external connection pooling
        // Prevents connection pool exhaustion in serverless environments
        ...(process.env.DATABASE_POOL_TIMEOUT && {
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
        }),
      })

      // Handle connection issues early
      prisma.$connect().catch((err) => {
        console.error('[prisma] Failed to connect to database:', err?.message || err)
        // Don't throw - let individual queries handle connection failures
      })

      // Ensure default admin exists (run once, idempotent).
      // Fire-and-forget: do not block Prisma initialization.
      createDefaultAdminIfMissing().catch((err) => {
        console.error('[prisma] createDefaultAdminIfMissing error:', err)
      })

      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prisma
      }

      console.info('[prisma] Client initialized successfully')
    } catch (err) {
      console.error('[prisma] Failed to initialize Prisma Client:', err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  return prisma
}

/**
 * Gracefully disconnect Prisma Client
 * Call this during app shutdown to release database connections
 */
export async function disconnectPrisma() {
  if (prisma) {
    try {
      await prisma.$disconnect()
      prisma = undefined
      console.info('[prisma] Client disconnected successfully')
    } catch (err) {
      console.error('[prisma] Error disconnecting client:', err instanceof Error ? err.message : String(err))
    }
  }
}


