import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPrice, formatDate, orderStatusLabels, orderStatusColors } from '@/lib/utils'
import { User, Package, Heart, LogOut } from 'lucide-react'

async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price),
    })),
  }))
}

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      _count: {
        select: {
          wishlistItems: true,
        },
      },
    },
  })
  return user
}

export const metadata = {
  title: 'Личный кабинет — Imbrand',
}

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account')
  }

  const [user, orders] = await Promise.all([
    getUserData(session.user.id),
    getUserOrders(session.user.id),
  ])

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-8">
        Личный кабинет
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Сайдбар */}
        <aside className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-6">
            {/* Информация о пользователе */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="font-semibold">{user.name || 'Пользователь'}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.role === 'ADMIN' && (
                <Badge className="mt-2">Администратор</Badge>
              )}
            </div>

            {/* Быстрые ссылки */}
            <div className="space-y-2">
              <Link
                href="/wishlist"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Избранное</span>
                </div>
                <Badge variant="secondary">{user._count.wishlistItems}</Badge>
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Админ-панель</span>
                </Link>
              )}
            </div>

            {/* Выход */}
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Выйти</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Основной контент */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Мои заказы</TabsTrigger>
              <TabsTrigger value="profile">Профиль</TabsTrigger>
            </TabsList>

            {/* Заказы */}
            <TabsContent value="orders" className="mt-6">
              {orders.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
                  <Button asChild>
                    <Link href="/catalog">Перейти в каталог</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <span className="font-semibold">
                            Заказ №{order.orderNumber}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            от {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <Badge className={orderStatusColors[order.status]}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {item.productName} ({item.productSize}, {item.productColor}) × {item.quantity}
                            </span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between pt-4 border-t">
                        <span className="font-medium">Итого:</span>
                        <span className="font-semibold">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Профиль */}
            <TabsContent value="profile" className="mt-6">
              <div className="border rounded-lg p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Имя</label>
                  <p className="font-medium">{user.name || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Телефон</label>
                  <p className="font-medium">{user.phone || '—'}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
