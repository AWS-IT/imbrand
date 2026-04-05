import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CheckoutForm } from './CheckoutForm'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  title: 'Оформление заказа — Imbrand',
}

export default async function CheckoutPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/checkout')
  }

  const cartItems = await getCartItems(session.user.id)

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

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // Получаем данные пользователя
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-8">
        Оформление заказа
      </h1>

      <CheckoutForm
        cartItems={cartItems}
        totalAmount={totalAmount}
        userEmail={user?.email}
        userName={user?.name}
        userPhone={user?.phone}
      />
    </div>
  )
}
