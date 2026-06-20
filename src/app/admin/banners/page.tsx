import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ImageIcon, Plus, Edit, Trash2 } from 'lucide-react'
import { BannerActions } from './BannerActions'

interface BannerItem {
  id: string
  title: string | null
  subtitle: string | null
  buttonLink: string | null
  imageUrl: string
  isActive: boolean
  position: number
}

async function getBanners(): Promise<BannerItem[]> {
  return (prisma as any).banner.findMany({
    orderBy: { position: 'asc' },
  })
}

export const metadata = {
  title: 'Баннеры — Админ-панель',
}

export default async function AdminBannersPage() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const banners = await getBanners()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Баннеры</h1>
          <p className="text-gray-500 mt-1">Управление слайдером на главной странице</p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/new">
            <Plus className="h-4 w-4 mr-2" />
            Добавить баннер
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Превью</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Ссылка</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Позиция</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Баннеров пока нет</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/admin/banners/new">Создать первый баннер</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title || 'Баннер'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{banner.title || '(без заголовка)'}</p>
                      {banner.subtitle && (
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {banner.buttonLink || '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      banner.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {banner.isActive ? 'Активен' : 'Скрыт'}
                    </span>
                  </TableCell>
                  <TableCell>{banner.position}</TableCell>
                  <TableCell>
                    <BannerActions bannerId={banner.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
