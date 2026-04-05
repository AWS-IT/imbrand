import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOrder } from '@/actions/order'

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Необходимо войти в аккаунт' },
      { status: 401 }
    )
  }

  try {
    const data = await request.json()

    // Валидация обязательных полей
    if (!data.customerName || !data.customerPhone) {
      return NextResponse.json(
        { error: 'Имя и телефон обязательны' },
        { status: 400 }
      )
    }

    const result = await createOrder({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      deliveryCity: data.deliveryCity,
      deliveryAddress: data.deliveryAddress,
      comment: data.comment,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      paymentUrl: result.paymentUrl,
    })
  } catch (error) {
    console.error('Ошибка оформления заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка оформления заказа' },
      { status: 500 }
    )
  }
}
