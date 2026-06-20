import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'
import { CartItemActions } from '@/components/cart/CartItemActions'

async function getCartItems(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            orderBy: { position: 'asc' },
            take: 1,
          },
        },
      },
      variant: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return items.map(item => ({
    ...item,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
  }))
}

export const metadata = {
  title: 'Корзина — Imbrand',
}

export default async function CartPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/cart')
  }

  const cartItems = await getCartItems(session.user.id)

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-display font-semibold mb-4">
            Корзина пуста
          </h1>
          <p className="text-gray-500 mb-8">
            Добавьте товары в корзину, чтобы оформить заказ
          </p>
          <Button asChild size="lg">
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-8">
        Корзина
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Список товаров */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 border rounded-lg"
            >
              {/* Изображение */}
              <Link
                href={`/product/${item.product.slug}`}
                className="relative w-24 h-32 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
              >
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
              </Link>

              {/* Информация */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="font-medium hover:text-gray-600 transition-colors line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <div className="mt-1 text-sm text-gray-500">
                  <span>Размер: {item.variant.size}</span>
                  <span className="mx-2">·</span>
                  <span>Цвет: {item.variant.color}</span>
                </div>
                <div className="mt-2 font-semibold">
                  {formatPrice(item.product.price)}
                </div>

                {/* Количество и удаление */}
                <div className="mt-4">
                  <CartItemActions
                    itemId={item.id}
                    quantity={item.quantity}
                    maxStock={item.variant.stock}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Итоги */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Итого</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Товары ({cartItems.length})</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Доставка</span>
                <span className="text-green-600">Бесплатно</span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>К оплате</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full mt-6">
              <Link href="/checkout">Оформить заказ</Link>
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Нажимая «Оформить заказ», вы соглашаетесь с условиями обработки персональных данных
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
