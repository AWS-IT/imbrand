import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BannerForm } from '../BannerForm'

export const metadata = {
  title: 'Новый баннер — Админ-панель',
}

export default async function NewBannerPage() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/banners"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад к баннерам
        </Link>
        <h1 className="text-2xl font-semibold">Новый баннер</h1>
      </div>

      <BannerForm />
    </div>
  )
}
