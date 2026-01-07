import { z } from 'zod'

// Base product schema for validation
// Note: Price is validated as number but will be converted to Decimal in Prisma
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  price: z.number().positive('Price must be a positive number').max(999999.99, 'Price is too large'),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  salesCount: z.number().int('Sales count must be an integer').min(0, 'Sales cannot be negative').optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  images: z.array(z.string().url('Each image must be a valid URL')).min(0, 'Images array cannot be negative').max(10, 'Maximum 10 images allowed'),
})

// Schema for creating a product (all fields required, but images can be empty array)
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  price: z.number().positive('Price must be a positive number').max(999999.99, 'Price is too large'),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  salesCount: z.number().int('Sales count must be an integer').min(0, 'Sales cannot be negative').optional().default(0),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  images: z.array(z.string().url('Each image must be a valid URL')).min(0).max(10, 'Maximum 10 images allowed').default([]),
})

// Schema for updating a product (all fields optional)
export const updateProductSchema = productSchema.partial()

// TypeScript types inferred from schemas
export type ProductInput = z.infer<typeof productSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

