import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react'
import { CategoryActions } from './CategoryActions'

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
    orderBy: [
      { parentId: 'asc' },
      { name: 'asc' },
    ],
  })

  return categories
}

export const metadata = {
  title: 'Категории — Админ-панель',
}

export default async function AdminCategoriesPage() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const categories = await getCategories()

  // Группируем по родителю для визуализации иерархии
  const rootCategories = categories.filter(c => !c.parentId)
  const childCategories = categories.filter(c => c.parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Категории</h1>
          <p className="text-gray-500 mt-1">Управление категориями товаров</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Добавить категорию
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Родитель</TableHead>
              <TableHead>Товаров</TableHead>
              <TableHead>Подкатегорий</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <FolderTree className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Категорий пока нет</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/admin/categories/new">Создать первую категорию</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {category.parentId && (
                        <span className="text-gray-400 ml-4">↳</span>
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{category.slug}</TableCell>
                  <TableCell>
                    {category.parent ? (
                      <span className="text-sm text-gray-600">{category.parent.name}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{category._count.products}</TableCell>
                  <TableCell>{category._count.children}</TableCell>
                  <TableCell>
                    <CategoryActions
                      categoryId={category.id}
                      hasProducts={category._count.products > 0}
                      hasChildren={category._count.children > 0}
                    />
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
