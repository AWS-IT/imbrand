import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/product/ProductCard'
import { Percent } from 'lucide-react'

async function getSaleProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      oldPrice: {
        not: null,
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

  // Фильтруем только товары со скидкой (где oldPrice > price)
  return products
    .map(p => ({
      ...p,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    }))
    .filter(p => p.oldPrice && p.oldPrice > p.price)
}

export const metadata = {
  title: 'Акции и скидки — Imbrand',
  description: 'Товары со скидками в интернет-магазине женской одежды Imbrand',
}

export default async function SalePage() {
  const products = await getSaleProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500 rounded-full">
            <Percent className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">
            Акции и скидки
          </h1>
        </div>
        <p className="text-gray-500">
          Товары по сниженным ценам
        </p>
      </div>

      {/* Товары */}
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16">
          <Percent className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold mb-2">Акций пока нет</h2>
          <p className="text-gray-500">
            Следите за обновлениями — скидки появляются регулярно
          </p>
        </div>
      )}
    </div>
  )
}
