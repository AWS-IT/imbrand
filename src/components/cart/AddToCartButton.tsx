'use client'

import { useState, useTransition } from 'react'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { addToCart } from '@/actions/cart'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  productId: string
  variantId: string
  disabled?: boolean
  className?: string
  size?: 'default' | 'sm' | 'lg'
}

export function AddToCartButton({
  productId,
  variantId,
  disabled = false,
  className,
  size = 'default'
}: AddToCartButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isAdded, setIsAdded] = useState(false)

  const handleAdd = () => {
    startTransition(async () => {
      const result = await addToCart(productId, variantId, 1)
      if (!result.error) {
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
      }
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      onClick={handleAdd}
      disabled={isPending || disabled}
      size={size}
      className={cn(
        "transition-all",
        isAdded && "bg-green-600 hover:bg-green-700",
        className
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Добавляем...
        </>
      ) : isAdded ? (
        <>
          <Check className="h-5 w-5 mr-2" />
          Добавлено
        </>
      ) : (
        <>
          <ShoppingBag className="h-5 w-5 mr-2" />
          В корзину
        </>
      )}
    </Button>
  )
}
