import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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
    if (!data.customerName?.trim()) {
      return NextResponse.json(
        { error: 'Укажите имя' },
        { status: 400 }
      )
    }

    if (!data.customerPhone?.trim()) {
      return NextResponse.json(
        { error: 'Укажите номер телефона' },
        { status: 400 }
      )
    }

    const result = await createOrder({
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail?.trim() || undefined,
      deliveryCity: data.deliveryCity?.trim() || undefined,
      deliveryAddress: data.deliveryAddress?.trim() || undefined,
      comment: data.comment?.trim() || undefined,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    })
  } catch (error) {
    console.error('Ошибка оформления заявки:', error)
    return NextResponse.json(
      { error: 'Ошибка оформления заявки. Попробуйте ещё раз.' },
      { status: 500 }
    )
  }
}
