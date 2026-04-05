'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { formatPrice, validateRussianPhone } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Схема валидации формы
const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Введите имя'),
  customerPhone: z.string()
    .min(10, 'Введите номер телефона')
    .refine(validateRussianPhone, 'Введите корректный российский номер'),
  customerEmail: z.string().email('Введите корректный email').optional().or(z.literal('')),
  deliveryCity: z.string().optional(),
  deliveryAddress: z.string().optional(),
  comment: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CartItem {
  id: string
  quantity: number
  product: {
    name: string
    slug: string
    price: number
    images: { url: string }[]
  }
  variant: {
    size: string
    color: string
  }
}

interface CheckoutFormProps {
  cartItems: CartItem[]
  totalAmount: number
  userEmail?: string | null
  userName?: string | null
  userPhone?: string | null
}

export function CheckoutForm({
  cartItems,
  totalAmount,
  userEmail,
  userName,
  userPhone,
}: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: userName || '',
      customerEmail: userEmail || '',
      customerPhone: userPhone || '',
    },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка оформления заказа')
      }

      // Перенаправляем на страницу оплаты
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        router.push(`/checkout/success?order=${result.orderNumber}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Форма */}
      <div className="lg:col-span-2 space-y-8">
        {/* Контактные данные */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Контактные данные</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Имя *</Label>
              <Input
                id="customerName"
                {...register('customerName')}
                placeholder="Ваше имя"
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Телефон *</Label>
              <Input
                id="customerPhone"
                type="tel"
                {...register('customerPhone')}
                placeholder="+7 (999) 123-45-67"
              />
              {errors.customerPhone && (
                <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="customerEmail">Email (необязательно)</Label>
              <Input
                id="customerEmail"
                type="email"
                {...register('customerEmail')}
                placeholder="email@example.com"
              />
              {errors.customerEmail && (
                <p className="text-sm text-red-500">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Доставка */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Доставка (необязательно)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryCity">Город</Label>
              <Input
                id="deliveryCity"
                {...register('deliveryCity')}
                placeholder="Москва"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="deliveryAddress">Адрес доставки</Label>
              <Textarea
                id="deliveryAddress"
                {...register('deliveryAddress')}
                placeholder="Улица, дом, квартира"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Комментарий */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Комментарий к заказу</h2>

          <Textarea
            {...register('comment')}
            placeholder="Дополнительная информация к заказу..."
            rows={3}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Итоги */}
      <div className="lg:col-span-1">
        <div className="border rounded-lg p-6 sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Ваш заказ</h2>

          {/* Товары */}
          <div className="space-y-4 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      Нет фото
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.variant.size}, {item.variant.color} × {item.quantity}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3 mt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Товары</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Доставка</span>
              <span className="text-green-600">Бесплатно</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Итого</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Оформляем...
              </>
            ) : (
              'Перейти к оплате'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Нажимая «Перейти к оплате», вы соглашаетесь с{' '}
            <Link href="/privacy" className="underline">
              политикой конфиденциальности
            </Link>
          </p>
        </div>
      </div>
    </form>
  )
}
