import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SuccessPageProps {
  searchParams: Promise<{
    order?: string
  }>
}

export const metadata = {
  title: 'Заявка оформлена — Imbrand',
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderNumber = params.order

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>

        <h1 className="text-2xl font-display font-semibold mb-3">
          Заявка принята!
        </h1>

        {orderNumber && (
          <p className="text-base text-gray-600 mb-3">
            Номер заявки:{' '}
            <span className="font-semibold text-gray-900">#{orderNumber}</span>
          </p>
        )}

        <p className="text-gray-500 mb-8 leading-relaxed">
          Мы получили вашу заявку и скоро свяжемся с вами для подтверждения заказа и обсуждения деталей доставки.
        </p>

        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/account">Мои заявки</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/catalog">Продолжить покупки</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
