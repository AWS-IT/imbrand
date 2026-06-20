import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/product/ProductCard'
import { Sparkles } from 'lucide-react'

async function getNewProducts() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      createdAt: {
        gte: thirtyDaysAgo,
      },
      variants: {
        some: {
          stock: { gt: 0 },
        },
      },
    },
    include: {
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return products.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
  }))
}

export const metadata = {
  title: 'Новинки — Imbrand',
  description: 'Новые поступления женской одежды в интернет-магазине Imbrand',
}

export default async function NewArrivalsPage() {
  const products = await getNewProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-display font-semibold">
            Новинки
          </h1>
        </div>
        <p className="text-gray-500">
          Последние поступления за 30 дней
        </p>
      </div>

      {/* Товары */}
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16">
          <Sparkles className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold mb-2">Новинок пока нет</h2>
          <p className="text-gray-500">
            Загляните позже — мы постоянно обновляем коллекцию
          </p>
        </div>
      )}
    </div>
  )
}
