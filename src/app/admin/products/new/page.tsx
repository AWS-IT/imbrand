import { prisma } from '@/lib/prisma'
import { ProductForm } from '../ProductForm'

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
  return categories
}

export const metadata = {
  title: 'Новый товар — Админ Imbrand',
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold">Новый товар</h1>
        <p className="text-gray-500 mt-1">Создание нового товара</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
