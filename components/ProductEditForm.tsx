"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { updateProductSchema, UpdateProductInput } from '@/lib/validations/product'

type Props = {
  id: string
  initial: UpdateProductInput
}

export default function ProductEditForm({ id, initial }: Props) {
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: initial.name ?? undefined,
      description: initial.description ?? undefined,
      price: initial.price ? Number(initial.price as unknown as number) : undefined,
      stock: initial.stock ?? undefined,
      salesCount: initial.salesCount ?? undefined,
      category: initial.category ?? undefined,
      images: initial.images ?? undefined,
    },
  })

  async function onSubmit(data: any) {
    setServerError(null)
    try {
      // If files are selected, send multipart FormData so server can upload them
      const filesInput = (document.querySelector('input[name="images"]') as HTMLInputElement | null)
      const files = filesInput?.files && filesInput.files.length ? Array.from(filesInput.files) : []

      let res: Response
      if (files.length > 0) {
        const fd = new FormData()
        if (data.name !== undefined) fd.append('name', String(data.name))
        if (data.description !== undefined) fd.append('description', String(data.description))
        if (data.price !== undefined) fd.append('price', String(data.price))
        if (data.stock !== undefined) fd.append('stock', String(data.stock))
        if (data.salesCount !== undefined) fd.append('salesCount', String(data.salesCount))
        if (data.category !== undefined) fd.append('category', String(data.category))
        // Append selected files
        files.forEach((f) => fd.append('images', f))
        res = await fetch(`/api/products/${id}`, { method: 'PUT', body: fd })
      } else {
        const payload: any = {}
        if (data.name !== undefined) payload.name = String(data.name)
        if (data.description !== undefined) payload.description = String(data.description)
        if (data.price !== undefined) payload.price = Number(data.price)
        if (data.stock !== undefined) payload.stock = Number(data.stock)
        if (data.salesCount !== undefined) payload.salesCount = Number(data.salesCount)
        if (data.category !== undefined) payload.category = String(data.category)
        // If user provided an image URL field, include it (keeps old images if omitted)
        if ((data as any).imageUrl) payload.images = [(data as any).imageUrl]

        res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const json = await res.json()
      if (json?.success) {
        setSuccessMessage('Product updated successfully')
        setTimeout(() => router.push('/dashboard'), 1400)
      } else {
        setServerError(json?.error || 'Update failed')
      }
    } catch (e: any) {
      setServerError(e?.message || 'Request failed')
    }
  }

  return (
    <div className="card">
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
          {successMessage}
        </div>
      )}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h2>
          </div>

          <div>
            <label htmlFor="name" className="form-label">
              Product Name
            </label>
            <input
              id="name"
              {...register('name')}
              className="form-input"
              placeholder="Enter product name"
            />
            {errors.name && (
              <div className="mt-1 text-sm text-red-600">{String(errors.name.message)}</div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="form-input min-h-[120px] resize-y"
              placeholder="Enter product description"
            />
            {errors.description && (
              <div className="mt-1 text-sm text-red-600">{String(errors.description.message)}</div>
            )}
          </div>

          <div>
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <input
              id="category"
              {...register('category')}
              className="form-input"
              placeholder="Enter category"
            />
            {errors.category && (
              <div className="mt-1 text-sm text-red-600">{String(errors.category.message)}</div>
            )}
          </div>
        </div>

        {/* Pricing & Inventory Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Pricing & Inventory</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="form-label">
                Price
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="form-input"
                placeholder="0.00"
              />
              {errors.price && (
                <div className="mt-1 text-sm text-red-600">{String(errors.price.message)}</div>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="form-label">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className="form-input"
                placeholder="0"
              />
              {errors.stock && (
                <div className="mt-1 text-sm text-red-600">{String(errors.stock.message)}</div>
              )}
            </div>

            <div>
              <label htmlFor="salesCount" className="form-label">
                Sales Count
              </label>
              <input
                id="salesCount"
                type="number"
                {...register('salesCount', { valueAsNumber: true })}
                className="form-input"
                placeholder="0"
              />
              {errors.salesCount && (
                <div className="mt-1 text-sm text-red-600">{String(errors.salesCount.message)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Media</h2>
          </div>

          {/* Current Images */}
          {initial.images && initial.images.length > 0 && (
            <div>
              <label className="form-label mb-3 block">Current Images</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {initial.images.map((url, index) => (
                  <div
                    key={url}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                  >
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                        Current
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload new images below to replace these. Leave empty to keep current images.
              </p>
            </div>
          )}

          {/* Upload New Images */}
          <div>
            <label htmlFor="images" className="form-label">
              Upload New Images
            </label>
            <input
              id="images"
              type="file"
              name="images"
              accept="image/*"
              multiple
              className="form-input py-2"
              onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : null)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Select one or more images. New images will replace existing ones.
            </p>
          </div>

          {/* Preview Selected Files */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div>
              <label className="form-label mb-3 block">New Image Previews</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2 text-xs text-gray-600 truncate">{file.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary px-6 py-2.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
