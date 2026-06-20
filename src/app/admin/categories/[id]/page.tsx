import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CategoryForm } from '../CategoryForm'

async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
  })
}

async function getAllCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export const metadata = {
  title: 'Редактирование категории — Админ-панель',
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const [category, allCategories] = await Promise.all([
    getCategory(id),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

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
        <h1 className="text-2xl font-semibold">Редактирование категории</h1>
      </div>

      <CategoryForm category={category} allCategories={allCategories} />
    </div>
  )
}
