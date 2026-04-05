'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { initPayment } from '@/lib/tinkoff'
import { sendOrderNotification } from '@/lib/notifications'
import { generateOrderNumber } from '@/lib/utils'
import type { Prisma, CartItem, Product, ProductVariant, Order, OrderItem, Payment, OrderStatus } from '@prisma/client'

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

type OrderItemWithVariant = OrderItem & {
  variant: ProductVariant | null
}

type OrderWithItems = Order & {
  items: OrderItemWithVariant[]
  payment: Payment | null
}

// Создание заказа
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
      (sum: number, item: CartItemWithRelations) => sum + Number(item.product.price) * item.quantity,
      0
    )

    const orderNumber = generateOrderNumber()

    // Создаём заказ в транзакции
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Создаём заказ
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
          status: 'PENDING_PAYMENT',
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
          items: true,
        },
      })

      return newOrder
    })

    // Инициируем платёж через Тинькофф
    const payment = await initPayment({
      amount: Math.round(totalAmount * 100), // в копейках
      orderId: order.id,
      description: `Заказ №${orderNumber} в магазине Imbrand`,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
    })

    if (!payment.success || !payment.paymentUrl) {
      // Удаляем заказ если не удалось создать платёж
      await prisma.order.delete({ where: { id: order.id } })
      return { error: payment.error || 'Ошибка создания платежа' }
    }

    // Сохраняем данные платежа
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        paymentId: payment.paymentId,
        paymentUrl: payment.paymentUrl,
        status: 'PENDING',
      },
    })

    revalidatePath('/cart')
    revalidatePath('/account')

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: payment.paymentUrl,
    }
  } catch (error) {
    console.error('Ошибка создания заказа:', error)
    return { error: 'Ошибка создания заказа' }
  }
}

// Обработка успешной оплаты (вызывается из webhook)
export async function processSuccessfulPayment(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
        payment: true,
      },
    }) as OrderWithItems | null

    if (!order) {
      console.error('Заказ не найден:', orderId)
      return false
    }

    if (order.status !== 'PENDING_PAYMENT') {
      console.log('Заказ уже обработан:', orderId)
      return true
    }

    // Обновляем заказ и списываем остатки в транзакции
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Обновляем статус заказа
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      })

      // Обновляем статус платежа
      await tx.payment.update({
        where: { orderId },
        data: {
          status: 'SUCCESS',
          confirmedAt: new Date(),
        },
      })

      // Списываем остатки
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }
      }

      // Очищаем корзину пользователя
      if (order.userId) {
        await tx.cartItem.deleteMany({
          where: { userId: order.userId },
        })
      }
    })

    // Отправляем уведомления владельцу
    await sendOrderNotification({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail || undefined,
      deliveryAddress: order.deliveryAddress || undefined,
      deliveryCity: order.deliveryCity || undefined,
      items: order.items.map((item: OrderItemWithVariant) => ({
        name: item.productName,
        size: item.productSize,
        color: item.productColor,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      totalAmount: Number(order.totalAmount),
      comment: order.comment || undefined,
    })

    return true
  } catch (error) {
    console.error('Ошибка обработки успешной оплаты:', error)
    return false
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
      data: { status: status as OrderStatus },
    })

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    return { error: 'Ошибка обновления статуса' }
  }
}
