'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { removeFromWishlist } from '@/actions/wishlist'
import { useRouter } from 'next/navigation'

interface RemoveFromWishlistButtonProps {
  productId: string
}

export function RemoveFromWishlistButton({ productId }: RemoveFromWishlistButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromWishlist(productId)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
      title="Удалить из избранного"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 text-gray-600" />
      )}
    </button>
  )
}
