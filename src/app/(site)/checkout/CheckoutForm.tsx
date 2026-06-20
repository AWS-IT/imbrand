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
import { formatPrice } from '@/lib/utils'
import { Loader2, ShoppingBag, Phone, User, Mail, MapPin, MessageSquare } from 'lucide-react'

// Схема валидации — телефон принимаем любой международный
const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Введите имя (минимум 2 символа)')
    .max(100, 'Слишком длинное имя'),
  customerPhone: z
    .string()
    .min(7, 'Введите номер телефона')
    .max(20, 'Слишком длинный номер')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Некорректный номер телефона'),
  customerEmail: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
  deliveryCity: z.string().max(100).optional(),
  deliveryAddress: z.string().max(300).optional(),
  comment: z.string().max(500, 'Комментарий слишком длинный').optional(),
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка оформления заявки')
      }

      // Успех — переходим на страницу подтверждения
      router.push(`/checkout/success?order=${result.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Левая колонка — поля формы */}
      <div className="lg:col-span-2 space-y-6">

        {/* Контактные данные */}
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Контактные данные
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Имя *</Label>
              <Input
                id="customerName"
                {...register('customerName')}
                placeholder="Ваше имя"
                autoComplete="name"
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Телефон *
                </span>
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                {...register('customerPhone')}
                placeholder="+7 (999) 123-45-67"
                autoComplete="tel"
              />
              {errors.customerPhone && (
                <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="customerEmail">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email <span className="text-gray-400 font-normal">(необязательно)</span>
                </span>
              </Label>
              <Input
                id="customerEmail"
                type="email"
                {...register('customerEmail')}
                placeholder="email@example.com"
                autoComplete="email"
              />
              {errors.customerEmail && (
                <p className="text-sm text-red-500">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Доставка */}
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            Адрес доставки
            <span className="text-sm font-normal text-gray-400">(необязательно)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="deliveryCity">Город</Label>
              <Input
                id="deliveryCity"
                {...register('deliveryCity')}
                placeholder="Москва"
                autoComplete="address-level2"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="deliveryAddress">Улица, дом, квартира</Label>
              <Textarea
                id="deliveryAddress"
                {...register('deliveryAddress')}
                placeholder="ул. Пушкина, д. 1, кв. 5"
                rows={2}
                autoComplete="street-address"
              />
              {errors.deliveryAddress && (
                <p className="text-sm text-red-500">{errors.deliveryAddress.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Комментарий */}
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            Комментарий
            <span className="text-sm font-normal text-gray-400">(необязательно)</span>
          </h2>
          <Textarea
            {...register('comment')}
            placeholder="Удобное время для связи, пожелания по доставке..."
            rows={3}
          />
          {errors.comment && (
            <p className="text-sm text-red-500">{errors.comment.message}</p>
          )}
        </div>

        {/* Ошибка */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Правая колонка — итог */}
      <div className="lg:col-span-1">
        <div className="border rounded-xl p-6 sticky top-24 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-400" />
            Ваш заказ
          </h2>

          {/* Список товаров */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-14 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs text-center px-1">
                      Нет фото
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 leading-snug">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.variant.size} · {item.variant.color} · {item.quantity} шт.
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Товары ({cartItems.length})</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Доставка</span>
              <span className="text-green-600 font-medium">По договорённости</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-base">
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
              'Оформить заявку'
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            После оформления заявки мы свяжемся с вами для подтверждения заказа и обсуждения оплаты
          </p>

          <p className="text-xs text-gray-400 text-center">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600">
              политикой конфиденциальности
            </Link>
          </p>
        </div>
      </div>
    </form>
  )
}
