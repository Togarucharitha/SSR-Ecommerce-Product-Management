import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

// Test-only endpoint to verify DB connectivity; not intended for production use.

/**
 * Test route to verify database connection
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Test database connection by querying product count
    const productCount = await prisma.product.count()

    // Optional: Try a simple query
    const products = await prisma.product.findMany({
      take: 1,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        productCount,
        sampleProduct: products[0] || null,
        timestamp: new Date().toISOString(),
        database: {
          type: 'PostgreSQL',
          provider: 'Prisma',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Database connection test failed:', error)

    let errorMessage = 'Unknown error occurred'
    let errorDetails = null

    if (error instanceof Error) {
      errorMessage = error.message

      // Provide helpful error messages
      if (errorMessage.includes('P1001')) {
        errorMessage = 'Cannot reach database server. Check DATABASE_URL and ensure PostgreSQL is running.'
      } else if (errorMessage.includes('P1000')) {
        errorMessage = 'Authentication failed. Check database credentials in DATABASE_URL.'
      } else if (errorMessage.includes('P1003')) {
        errorMessage = 'Database does not exist. Create the database first.'
      } else if (errorMessage.includes('P1017')) {
        errorMessage = 'Server closed the connection. Check database server status.'
      }

      errorDetails = {
        code: (error as any).code || 'UNKNOWN',
        meta: (error as any).meta || null,
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        troubleshooting: {
          checkEnvFile: 'Verify DATABASE_URL in .env file',
          checkDatabase: 'Ensure PostgreSQL is running and accessible',
          checkCredentials: 'Verify username, password, and database name',
        },
      },
      { status: 500 }
    )
  }
}

