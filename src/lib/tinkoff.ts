import crypto from 'crypto'

// Конфигурация Тинькофф
const TINKOFF_TERMINAL_KEY = process.env.TINKOFF_TERMINAL_KEY!
const TINKOFF_SECRET_KEY = process.env.TINKOFF_SECRET_KEY!
const TINKOFF_API_URL = 'https://securepay.tinkoff.ru/v2'

// Типы данных
interface InitPaymentParams {
  amount: number // в копейках
  orderId: string
  description: string
  customerEmail?: string
  customerPhone?: string
  successUrl?: string
  failUrl?: string
  notificationUrl?: string
}

interface InitPaymentResponse {
  Success: boolean
  ErrorCode: string
  Message?: string
  PaymentId?: string
  PaymentURL?: string
}

interface PaymentStatusResponse {
  Success: boolean
  ErrorCode: string
  Message?: string
  Status?: string
  PaymentId?: string
  Amount?: number
}

// Генерация подписи для запроса
function generateToken(data: Record<string, unknown>): string {
  // Добавляем Password (секретный ключ)
  const dataWithPassword: Record<string, unknown> = { ...data, Password: TINKOFF_SECRET_KEY }

  // Сортируем ключи по алфавиту
  const sortedKeys = Object.keys(dataWithPassword).sort()

  // Конкатенируем значения
  const values = sortedKeys
    .filter(key => dataWithPassword[key] !== undefined && dataWithPassword[key] !== null)
    .map(key => String(dataWithPassword[key]))
    .join('')

  // Генерируем SHA-256 хеш
  return crypto.createHash('sha256').update(values).digest('hex')
}

// Инициализация платежа
export async function initPayment(params: InitPaymentParams): Promise<{
  success: boolean
  paymentId?: string
  paymentUrl?: string
  error?: string
}> {
  const data = {
    TerminalKey: TINKOFF_TERMINAL_KEY,
    Amount: params.amount,
    OrderId: params.orderId,
    Description: params.description,
    SuccessURL: params.successUrl || process.env.TINKOFF_SUCCESS_URL,
    FailURL: params.failUrl || process.env.TINKOFF_FAIL_URL,
    NotificationURL: params.notificationUrl || process.env.TINKOFF_NOTIFICATION_URL,
    Receipt: params.customerEmail || params.customerPhone ? {
      Email: params.customerEmail,
      Phone: params.customerPhone,
      Taxation: 'usn_income', // УСН доходы
      Items: [
        {
          Name: params.description.slice(0, 128), // Максимум 128 символов
          Quantity: 1,
          Amount: params.amount,
          Price: params.amount,
          PaymentMethod: 'full_payment',
          PaymentObject: 'commodity',
          Tax: 'none',
        },
      ],
    } : undefined,
  }

  // Генерируем токен (без Receipt, так как он вложенный)
  const tokenData = {
    TerminalKey: data.TerminalKey,
    Amount: data.Amount,
    OrderId: data.OrderId,
    Description: data.Description,
  }

  const token = generateToken(tokenData)

  try {
    const response = await fetch(`${TINKOFF_API_URL}/Init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        Token: token,
      }),
    })

    const result: InitPaymentResponse = await response.json()

    if (result.Success && result.PaymentURL) {
      return {
        success: true,
        paymentId: result.PaymentId,
        paymentUrl: result.PaymentURL,
      }
    }

    return {
      success: false,
      error: result.Message || 'Ошибка создания платежа',
    }
  } catch (error) {
    console.error('Ошибка инициализации платежа Тинькофф:', error)
    return {
      success: false,
      error: 'Ошибка связи с платёжной системой',
    }
  }
}

// Проверка статуса платежа
export async function getPaymentStatus(paymentId: string): Promise<{
  success: boolean
  status?: string
  amount?: number
  error?: string
}> {
  const data = {
    TerminalKey: TINKOFF_TERMINAL_KEY,
    PaymentId: paymentId,
  }

  const token = generateToken(data)

  try {
    const response = await fetch(`${TINKOFF_API_URL}/GetState`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        Token: token,
      }),
    })

    const result: PaymentStatusResponse = await response.json()

    if (result.Success) {
      return {
        success: true,
        status: result.Status,
        amount: result.Amount,
      }
    }

    return {
      success: false,
      error: result.Message || 'Ошибка получения статуса',
    }
  } catch (error) {
    console.error('Ошибка получения статуса платежа:', error)
    return {
      success: false,
      error: 'Ошибка связи с платёжной системой',
    }
  }
}

// Проверка подписи вебхука от Тинькофф
export function verifyWebhookSignature(data: Record<string, unknown>): boolean {
  const receivedToken = data.Token as string
  if (!receivedToken) return false

  // Убираем Token из данных для проверки
  const dataWithoutToken = { ...data }
  delete dataWithoutToken.Token

  // Генерируем ожидаемый токен
  const expectedToken = generateToken(dataWithoutToken)

  return receivedToken === expectedToken
}

// Статусы платежей Тинькофф
export const TinkoffPaymentStatus = {
  NEW: 'NEW',
  FORM_SHOWED: 'FORM_SHOWED',
  AUTHORIZING: 'AUTHORIZING',
  THREE_DS_CHECKING: '3DS_CHECKING',
  THREE_DS_CHECKED: '3DS_CHECKED',
  AUTHORIZED: 'AUTHORIZED',
  CONFIRMING: 'CONFIRMING',
  CONFIRMED: 'CONFIRMED', // Успешная оплата
  REVERSING: 'REVERSING',
  REVERSED: 'REVERSED',
  REFUNDING: 'REFUNDING',
  PARTIAL_REFUNDED: 'PARTIAL_REFUNDED',
  REFUNDED: 'REFUNDED',
  CANCELED: 'CANCELED', // Отмена
  REJECTED: 'REJECTED', // Отклонён
  DEADLINE_EXPIRED: 'DEADLINE_EXPIRED',
} as const

export type TinkoffPaymentStatusType = typeof TinkoffPaymentStatus[keyof typeof TinkoffPaymentStatus]
