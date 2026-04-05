import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '../ProductForm'

interface ProductEditPageProps {
  params: Promise<{
    id: string
  }>
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      variants: {
        orderBy: [{ size: 'asc' }, { color: 'asc' }],
      },
    },
  })

  if (!product) return null

  return {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
  }
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
  return categories
}

export const metadata = {
  title: 'Редактирование товара — Админ Imbrand',
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold">Редактирование товара</h1>
        <p className="text-gray-500 mt-1">{product.name}</p>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  )
}
