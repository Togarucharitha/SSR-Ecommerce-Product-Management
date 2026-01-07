import { PrismaClient } from '@prisma/client'
import { createDefaultAdminIfMissing } from './auth'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

let prisma: PrismaClient | undefined = globalForPrisma.prisma

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    // Ensure default admin exists (run once, idempotent).
    // Fire-and-forget: do not block Prisma initialization.
    createDefaultAdminIfMissing().catch((err) => {
      console.error('[prisma] createDefaultAdminIfMissing error:', err)
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
  }

  return prisma
}

