import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CategoryForm } from '../CategoryForm'

async function getAllCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export const metadata = {
  title: 'Новая категория — Админ-панель',
}

export default async function NewCategoryPage() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const allCategories = await getAllCategories()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад к категориям
        </Link>
        <h1 className="text-2xl font-semibold">Новая категория</h1>
      </div>

      <CategoryForm allCategories={allCategories} />
    </div>
  )
}
