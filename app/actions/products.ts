'use server'

import { revalidatePath } from 'next/cache'
// No runtime Decimal import — pass decimal values as strings to Prisma
import { prisma } from '@/lib/prisma'
import { demoProducts } from '@/lib/demoData'
import { createProductSchema, updateProductSchema } from '@/lib/validations/product'
import type { CreateProductInput, UpdateProductInput } from '@/lib/validations/product'

/**
 * Server Action: Create a new product
 */
export async function createProduct(input: CreateProductInput) {
  try {
    // Validate input using Zod
    const validatedData = createProductSchema.parse(input)

    // Create product in database
    // Convert price number to Decimal for Prisma
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: String(validatedData.price),
        stock: validatedData.stock,
        category: validatedData.category,
        images: validatedData.images,
        salesCount: validatedData.salesCount ?? 0,
      },
    })

    // Revalidate the dashboard page to show the new product
    revalidatePath('/dashboard')

    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    }
  } catch (error) {
    console.error('Error creating product:', error)

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Validation failed',
        details: error.message,
      }
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      return {
        success: false,
        error: 'Failed to create product',
        details: error.message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      details: 'Unknown error',
    }
  }
}

/**
 * Server Action: Update an existing product
 */
export async function updateProduct(id: string, input: UpdateProductInput) {
  try {
    // Validate input using Zod
    const validatedData = updateProductSchema.parse(input)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Update product in database
    // Convert price to Decimal if provided
    const updateData: any = { ...validatedData }
    if (validatedData.price !== undefined) {
      updateData.price = String(validatedData.price)
    }

    // Ensure salesCount is passed as number if present
    if (validatedData.salesCount !== undefined) {
      updateData.salesCount = Number(validatedData.salesCount)
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    // Revalidate the dashboard page
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/products/${id}`)

    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    }
  } catch (error) {
    console.error('Error updating product:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Validation failed',
        details: error.message,
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: 'Failed to update product',
        details: error.message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      details: 'Unknown error',
    }
  }
}

/**
 * Server Action: Delete a product
 */
export async function deleteProduct(id: string) {
  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Delete product from database
    await prisma.product.delete({
      where: { id },
    })

    // Revalidate the dashboard page
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting product:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: 'Failed to delete product',
        details: error.message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      details: 'Unknown error',
    }
  }
}

/**
 * Server Action: Get a single product by ID
 */
export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    console.error('Error fetching product:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: 'Failed to fetch product',
        details: error.message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      details: 'Unknown error',
    }
  }
}

/**
 * Server Action: Get all products (for server components)
 */
export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    // If DB has no products (dev/seeding), fall back to demo products for a usable UI
    if (!products || products.length === 0) {
      return {
        success: true,
        data: demoProducts,
        notice: 'Using demo products (no DB products found)'
      }
    }

    return {
      success: true,
      data: products,
    }
  } catch (error) {
    console.error('Error fetching products:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: 'Failed to fetch products',
        details: error.message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      details: 'Unknown error',
    }
  }
}

