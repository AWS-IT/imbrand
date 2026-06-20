'use client'

import { useState, useTransition } from 'react'
import { Trash2, Minus, Plus, Loader2 } from 'lucide-react'
import { updateCartItem, removeFromCart } from '@/actions/cart'
import { useRouter } from 'next/navigation'

interface CartItemActionsProps {
  itemId: string
  quantity: number
  maxStock: number
}

export function CartItemActions({ itemId, quantity, maxStock }: CartItemActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentQuantity, setCurrentQuantity] = useState(quantity)

  const handleUpdate = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return

    setCurrentQuantity(newQuantity)
    startTransition(async () => {
      const result = await updateCartItem(itemId, newQuantity)
      if (result.error) {
        setCurrentQuantity(quantity)
      }
      router.refresh()
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCart(itemId)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center border rounded-md">
        <button
          type="button"
          onClick={() => handleUpdate(currentQuantity - 1)}
          disabled={isPending || currentQuantity <= 1}
          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm">
          {isPending ? <Loader2 className="h-4 w-4 mx-auto animate-spin" /> : currentQuantity}
        </span>
        <button
          type="button"
          onClick={() => handleUpdate(currentQuantity + 1)}
          disabled={isPending || currentQuantity >= maxStock}
          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}
