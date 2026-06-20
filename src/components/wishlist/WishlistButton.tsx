'use client'

import { useState, useTransition } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from '@/actions/wishlist'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  isInWishlist: boolean
  className?: string
  showText?: boolean
}

export function WishlistButton({ productId, isInWishlist, className, showText = false }: WishlistButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(isInWishlist)

  const handleToggle = () => {
    const newState = !isActive
    setIsActive(newState)

    startTransition(async () => {
      const result = newState
        ? await addToWishlist(productId)
        : await removeFromWishlist(productId)

      if (result.error) {
        setIsActive(isActive)
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 transition-colors",
        isActive ? "text-red-500" : "text-gray-400 hover:text-red-500",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={cn("h-5 w-5", isActive && "fill-current")} />
      )}
      {showText && (
        <span className="text-sm">
          {isActive ? "В избранном" : "В избранное"}
        </span>
      )}
    </button>
  )
}
