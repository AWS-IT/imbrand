import { formatPrice, formatPhone } from './utils'

// Конфигурация
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
const GREEN_API_INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN
const GREEN_API_PHONE_NUMBER = process.env.GREEN_API_PHONE_NUMBER

const NOTIFICATION_TELEGRAM_ENABLED = process.env.NOTIFICATION_TELEGRAM_ENABLED === 'true'
const NOTIFICATION_WHATSAPP_ENABLED = process.env.NOTIFICATION_WHATSAPP_ENABLED === 'true'

// Типы данных для уведомления о заказе
interface OrderNotificationData {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress?: string
  deliveryCity?: string
  items: Array<{
    name: string
    size: string
    color: string
    quantity: number
    price: number
  }>
  totalAmount: number
  comment?: string
}

// Форматирование сообщения о заказе
function formatOrderMessage(data: OrderNotificationData): string {
  const itemsList = data.items
    .map(item => `  • ${item.name}\n    Размер: ${item.size}, Цвет: ${item.color}\n    ${item.quantity} шт. × ${formatPrice(item.price)} = ${formatPrice(item.quantity * item.price)}`)
    .join('\n\n')

  let message = `🛍️ НОВЫЙ ЗАКАЗ №${data.orderNumber}\n\n`
  message += `👤 Покупатель: ${data.customerName}\n`
  message += `📱 Телефон: ${formatPhone(data.customerPhone)}\n`

  if (data.customerEmail) {
    message += `📧 Email: ${data.customerEmail}\n`
  }

  if (data.deliveryAddress || data.deliveryCity) {
    message += `\n📍 Адрес доставки:\n`
    if (data.deliveryCity) message += `   ${data.deliveryCity}\n`
    if (data.deliveryAddress) message += `   ${data.deliveryAddress}\n`
  }

  message += `\n📦 Состав заказа:\n${itemsList}\n\n`
  message += `💰 ИТОГО: ${formatPrice(data.totalAmount)}\n`

  if (data.comment) {
    message += `\n💬 Комментарий: ${data.comment}\n`
  }

  message += `\n✅ Оплата подтверждена`

  return message
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram: не настроены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    const result = await response.json()

    if (!result.ok) {
      console.error('Ошибка отправки в Telegram:', result)
      return false
    }

    return true
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error)
    return false
  }
}

// Отправка сообщения в WhatsApp через Green-API
async function sendWhatsAppMessage(message: string): Promise<boolean> {
  if (!GREEN_API_INSTANCE_ID || !GREEN_API_TOKEN || !GREEN_API_PHONE_NUMBER) {
    console.error('WhatsApp: не настроены GREEN_API параметры')
    return false
  }

  try {
    // Форматируем номер телефона (убираем + и пробелы)
    const phone = GREEN_API_PHONE_NUMBER.replace(/\D/g, '')
    const chatId = `${phone}@c.us`

    const response = await fetch(
      `https://api.green-api.com/waInstance${GREEN_API_INSTANCE_ID}/sendMessage/${GREEN_API_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          message,
        }),
      }
    )

    const result = await response.json()

    if (!result.idMessage) {
      console.error('Ошибка отправки в WhatsApp:', result)
      return false
    }

    return true
  } catch (error) {
    console.error('Ошибка отправки в WhatsApp:', error)
    return false
  }
}

// Отправка уведомления о новом заказе
export async function sendOrderNotification(data: OrderNotificationData): Promise<{
  telegram: boolean
  whatsapp: boolean
}> {
  const message = formatOrderMessage(data)

  const results = {
    telegram: false,
    whatsapp: false,
  }

  // Отправляем параллельно в оба канала
  const promises: Promise<void>[] = []

  if (NOTIFICATION_TELEGRAM_ENABLED) {
    promises.push(
      sendTelegramMessage(message).then(success => {
        results.telegram = success
      })
    )
  }

  if (NOTIFICATION_WHATSAPP_ENABLED) {
    promises.push(
      sendWhatsAppMessage(message).then(success => {
        results.whatsapp = success
      })
    )
  }

  await Promise.all(promises)

  return results
}

// Отправка произвольного сообщения владельцу
export async function sendNotification(message: string): Promise<{
  telegram: boolean
  whatsapp: boolean
}> {
  const results = {
    telegram: false,
    whatsapp: false,
  }

  const promises: Promise<void>[] = []

  if (NOTIFICATION_TELEGRAM_ENABLED) {
    promises.push(
      sendTelegramMessage(message).then(success => {
        results.telegram = success
      })
    )
  }

  if (NOTIFICATION_WHATSAPP_ENABLED) {
    promises.push(
      sendWhatsAppMessage(message).then(success => {
        results.whatsapp = success
      })
    )
  }

  await Promise.all(promises)

  return results
}
