"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createProductSchema, CreateProductInput } from '@/lib/validations/product'

export default function ProductCreateForm() {
  const router = useRouter()
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [step, setStep] = useState<number>(1)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { images: [] as string[] },
  })

  async function handleNext() {
    if (step === 1) {
      const ok = await trigger(['name', 'description', 'category'])
      if (!ok) return
      setStep(2)
    } else if (step === 2) {
      const ok = await trigger(['price', 'stock'])
      if (!ok) return
      setStep(3)
    }
  }

  function handleBack() {
    setServerMessage(null)
    setSuccessMessage(null)
    if (step > 1) setStep(step - 1)
  }

  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null)

  function handleSelectFiles(files: FileList | null) {
    if (!files) return setSelectedFiles(null)
    setSelectedFiles(Array.from(files))
  }

  async function onSubmit(data: any) {
    setServerMessage(null)
    setSuccessMessage(null)
    
    try {
      // Build FormData to send files + fields to the server route which will handle upload
      const fd = new FormData()
      const values = getValues()
      
      // Validate required fields
      if (!values.name || !values.description || !values.category) {
        setServerMessage('Please fill in all required fields')
        return
      }
      
      if (!values.price || values.price <= 0) {
        setServerMessage('Please enter a valid price')
        return
      }
      
      if (values.stock === undefined || values.stock < 0) {
        setServerMessage('Please enter a valid stock quantity')
        return
      }
      
      fd.append('name', String(values.name))
      fd.append('description', String(values.description))
      fd.append('price', String(values.price))
      fd.append('stock', String(values.stock ?? 0))
      fd.append('salesCount', String(values.salesCount ?? 0))
      fd.append('category', String(values.category))

      if (selectedFiles && selectedFiles.length) {
        selectedFiles.forEach((f) => fd.append('images', f))
      }

      // If no files selected but developer provided an image URL via field 'imageUrl', include it
      const manualUrl = (values as any).imageUrl
      if ((!selectedFiles || selectedFiles.length === 0) && manualUrl) {
        fd.append('images', manualUrl)
      }

      console.log('Submitting product form...')
      const res = await fetch('/api/products', {
        method: 'POST',
        body: fd,
      })
      
      const json = await res.json()
      console.log('API response:', json)
      
      if (json?.success) {
        // Show success message briefly before redirecting
        setSuccessMessage('Product created successfully! Redirecting...')
        // Wait a moment to show the message, then navigate
        setTimeout(() => {
          router.push('/dashboard?created=1')
        }, 1000)
      } else {
        const errorMsg = json?.error || json?.details || 'Failed to create product'
        console.error('Product creation error:', errorMsg)
        setServerMessage(errorMsg)
      }
    } catch (e: any) {
      console.error('Form submission error:', e)
      setServerMessage(e?.message || 'Request failed. Please check your connection and try again.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="text-xl font-semibold">Create Product</h2>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Step {step} of 3</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input {...register('name')} className="form-input" />
              {errors.name && <div className="text-sm text-red-600">{String(errors.name.message)}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea {...register('description')} className="form-input" style={{ minHeight: 120 }} />
              {errors.description && <div className="text-sm text-red-600">{String(errors.description.message)}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <input {...register('category')} className="form-input" />
              {errors.category && <div className="text-sm text-red-600">{String(errors.category.message)}</div>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-3">
              <label className="form-label">Price</label>
              <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="form-input" />
              {errors.price && <div className="text-sm text-red-600">{String(errors.price.message)}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Stock</label>
              <input type="number" {...register('stock', { valueAsNumber: true })} className="form-input" />
              {errors.stock && <div className="text-sm text-red-600">{String(errors.stock.message)}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Sales Count (optional)</label>
              <input type="number" {...register('salesCount', { valueAsNumber: true })} className="form-input" />
              <div className="text-sm text-gray-500">Enter historical units sold for this product (optional).</div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                name="images"
                onChange={(e) => handleSelectFiles(e.target.files)}
                className="form-input"
              />
              <div className="text-sm text-gray-500 mt-1">You can upload one image. Preview shown after selection.</div>
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-3">
                <div className="border rounded overflow-hidden max-w-xs">
                  <img src={URL.createObjectURL(selectedFiles[0])} alt={selectedFiles[0].name} className="w-full h-48 object-cover" />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-end mt-6 gap-2">
          {step > 1 && (
            <button type="button" onClick={handleBack} className="btn btn-secondary">Back</button>
          )}

          {step < 3 && (
            <button type="button" onClick={handleNext} className="btn btn-primary">Next</button>
          )}

          {step === 3 && (
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Creating...' : 'Create Product'}</button>
          )}
        </div>
      </form>

      {serverMessage && <div className="mt-4 text-sm text-red-600">{serverMessage}</div>}
      {successMessage && <div className="mt-4 text-sm text-green-600">{successMessage}</div>}
    </div>
  )
}
