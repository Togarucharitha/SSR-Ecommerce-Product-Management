"use client"

import { useRouter } from 'next/navigation'
import React from 'react'

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this product? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json?.success) {
        router.refresh()
      } else {
        alert(json?.error || 'Delete failed')
      }
    } catch (e: any) {
      alert(e?.message || 'Request failed')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="btn btn-danger px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      Delete
    </button>
  )
}
