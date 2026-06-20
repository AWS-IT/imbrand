import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BannerForm } from '../BannerForm'

async function getBanner(id: string) {
  return (prisma as any).banner.findUnique({
    where: { id },
  })
}

export const metadata = {
  title: 'Редактирование баннера — Админ-панель',
}

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const banner = await getBanner(id)

  if (!banner) {
    notFound()
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
        <h1 className="text-2xl font-semibold">Редактирование баннера</h1>
      </div>

      <BannerForm banner={banner} />
    </div>
  )
}
