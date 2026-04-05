import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPrice, formatDateTime, orderStatusLabels, orderStatusColors } from '@/lib/utils'
import { Eye } from 'lucide-react'

async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
  }))
}

export const metadata = {
  title: 'Заказы — Админ Imbrand',
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Заказы</h1>
          <p className="text-gray-500 mt-1">
            Всего заказов: {orders.length}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Заказов пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Информация о заказе */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg">
                        №{order.orderNumber}
                      </span>
                      <Badge className={orderStatusColors[order.status]}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  {/* Покупатель */}
                  <div className="lg:text-center">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                    {order.customerEmail && (
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    )}
                  </div>

                  {/* Сумма и действия */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} товаров
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Подробнее
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Адрес доставки */}
                {(order.deliveryCity || order.deliveryAddress) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Доставка:</span>{' '}
                      {[order.deliveryCity, order.deliveryAddress].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}

                {/* Комментарий */}
                {order.comment && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Комментарий:</span> {order.comment}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
