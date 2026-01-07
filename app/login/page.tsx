"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setIsLoading(true)
    
    console.log('Form submitted with data:', { email: data.email })

    try {
      console.log('Attempting login with:', { email: data.email })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Important for cookies
      })

      console.log('Login response status:', response.status)
      
      // Check if response is ok before parsing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setError(errorData.error || `Login failed with status ${response.status}`)
        setIsLoading(false)
        return
      }
      
      const result = await response.json()
      console.log('Login response:', result)
      console.log('Success value:', result.success, 'Type:', typeof result.success)

      if (result.success === true) {
        // Get redirect URL or default to dashboard
        const redirect = searchParams.get('redirect') || '/dashboard'
        console.log('✅ Login successful!')
        console.log('User data:', result.user)
        console.log('Redirecting to:', redirect)
        
        // Clear any error state
        setError(null)
        
        // Wait a moment for cookie to be set, then redirect
        // This ensures the cookie is available when middleware runs
        setTimeout(() => {
          console.log('Executing redirect to:', redirect)
          // Use window.location.replace to avoid adding to history
          window.location.replace(redirect)
        }, 100)
        
        // Don't set loading to false - we're redirecting
        return
      } else {
        const errorMsg = result.error || result.details || 'Login failed. Please try again.'
        console.error('Login failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (err: any) {
      console.error('Login network error:', err)
      setError(`Network error: ${err.message || 'Please check if the server is running and try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)(e)
          }} 
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Only admin users can access the dashboard
        </p>
      </div>
    </main>
  )
}

