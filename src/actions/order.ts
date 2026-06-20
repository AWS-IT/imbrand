'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderNotification } from '@/lib/notifications'
import { generateOrderNumber } from '@/lib/utils'
import type { Prisma, CartItem, Product, ProductVariant } from '@prisma/client'

interface CreateOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryCity?: string
  deliveryAddress?: string
  comment?: string
}

type CartItemWithRelations = CartItem & {
  product: Product
  variant: ProductVariant
}

// Создание заявки (без оплаты)
export async function createOrder(data: CreateOrderData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    // Получаем корзину пользователя
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
        variant: true,
      },
    })

    if (cartItems.length === 0) {
      return { error: 'Корзина пуста' }
    }

    // Проверяем наличие всех товаров
    for (const item of cartItems) {
      if (item.variant.stock < item.quantity) {
        return {
          error: `Недостаточно товара "${item.product.name}" (${item.variant.size}, ${item.variant.color}). В наличии: ${item.variant.stock} шт.`,
        }
      }
    }

    // Считаем общую сумму
    const totalAmount = cartItems.reduce(
      (sum: number, item: CartItemWithRelations) =>
        sum + Number(item.product.price) * item.quantity,
      0
    )

    const orderNumber = generateOrderNumber()

    // Создаём заявку и сразу очищаем корзину в одной транзакции
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          totalAmount,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          deliveryCity: data.deliveryCity || null,
          deliveryAddress: data.deliveryAddress || null,
          comment: data.comment || null,
          // Статус сразу "в обработке" — оплата при получении/по договорённости
          status: 'PROCESSING',
          items: {
            create: cartItems.map((item: CartItemWithRelations) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.product.price,
              productName: item.product.name,
              productSize: item.variant.size,
              productColor: item.variant.color,
            })),
          },
        },
        include: {
          items: {
            include: {
              variant: true,
            },
          },
        },
      })

      // Очищаем корзину сразу
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      })

      return newOrder
    })

    // Отправляем уведомление владельцу сразу после создания заявки
    sendOrderNotification({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail ?? undefined,
      deliveryAddress: order.deliveryAddress ?? undefined,
      deliveryCity: order.deliveryCity ?? undefined,
      items: order.items.map((item) => ({
        name: item.productName,
        size: item.productSize,
        color: item.productColor,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      totalAmount: Number(order.totalAmount),
      comment: order.comment ?? undefined,
    }).catch((err) => {
      // Не блокируем ответ если уведомление не дошло — заявка уже создана
      console.error('Ошибка отправки уведомления о заявке:', err)
    })

    revalidatePath('/cart')
    revalidatePath('/account')

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    }
  } catch (error) {
    console.error('Ошибка создания заявки:', error)
    return { error: 'Ошибка создания заявки. Попробуйте ещё раз.' }
  }
}

// Обновление статуса заказа (для админа)
export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Нет доступа' }
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    })

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    return { error: 'Ошибка обновления статуса' }
  }
}
