import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react'

async function getDashboardStats() {
  const [
    productsCount,
    ordersCount,
    usersCount,
    pendingOrdersCount,
    recentOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { totalAmount: true },
    }),
  ])

  return {
    productsCount,
    ordersCount,
    usersCount,
    pendingOrdersCount,
    recentOrders: recentOrders.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    })),
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
  }
}

export const metadata = {
  title: 'Дашборд — Админ Imbrand',
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold">Дашборд</h1>
        <p className="text-gray-500 mt-1">Обзор вашего магазина</p>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Выручка
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Оплаченные заказы
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Заказы
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingOrdersCount} ожидают оплаты
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Товары
            </CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Активных товаров
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Пользователи
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usersCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Зарегистрировано
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Последние заказы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Последние заказы
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Заказов пока нет
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">№{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.customerName} · {order.customerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
