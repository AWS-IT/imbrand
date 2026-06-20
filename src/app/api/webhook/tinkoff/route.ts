/*import { NextResponse } from 'next/server'
import { verifyWebhookSignature, TinkoffPaymentStatus } from '@/lib/tinkoff'
import { processSuccessfulPayment } from '@/actions/order'

// Webhook от Тинькофф для обработки платежей
export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log('Получен webhook от Тинькофф:', data)

    // Проверяем подпись
    if (!verifyWebhookSignature(data)) {
      console.error('Неверная подпись webhook')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { OrderId, Status, PaymentId, Amount } = data

    console.log(`Статус платежа ${PaymentId} для заказа ${OrderId}: ${Status}`)

    // Обрабатываем статус
    switch (Status) {
      case TinkoffPaymentStatus.CONFIRMED:
        // Успешная оплата
        const success = await processSuccessfulPayment(OrderId)
        if (!success) {
          console.error('Ошибка обработки успешной оплаты для заказа:', OrderId)
        }
        break

      case TinkoffPaymentStatus.CANCELED:
      case TinkoffPaymentStatus.REJECTED:
      case TinkoffPaymentStatus.DEADLINE_EXPIRED:
        // Отмена/отклонение платежа
        console.log(`Платёж отменён/отклонён для заказа: ${OrderId}`)
        // Можно обновить статус заказа или удалить его
        break

      case TinkoffPaymentStatus.REFUNDED:
      case TinkoffPaymentStatus.PARTIAL_REFUNDED:
        // Возврат
        console.log(`Возврат для заказа: ${OrderId}`)
        // Обработка возврата
        break

      default:
        // Промежуточные статусы - просто логируем
        console.log(`Промежуточный статус ${Status} для заказа ${OrderId}`)
    }

    // Тинькофф ожидает ответ "OK"
    return NextResponse.json({ status: 'OK' })
  } catch (error) {
    console.error('Ошибка обработки webhook:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Тинькофф также может отправлять GET для проверки доступности
export async function GET() {
  return NextResponse.json({ status: 'OK' })
}
*/