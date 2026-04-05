import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SuccessPageProps {
  searchParams: Promise<{
    order?: string
  }>
}

export const metadata = {
  title: 'Заказ оформлен — Imbrand',
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderNumber = params.order

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-6" />

        <h1 className="text-2xl font-display font-semibold mb-4">
          Спасибо за заказ!
        </h1>

        {orderNumber && (
          <p className="text-lg text-gray-600 mb-4">
            Номер вашего заказа: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}

        <p className="text-gray-500 mb-8">
          Мы уже приступили к обработке вашего заказа. Вы получите уведомление о его статусе на указанный телефон.
        </p>

        <div className="space-y-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/account">Мои заказы</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/catalog">Продолжить покупки</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
