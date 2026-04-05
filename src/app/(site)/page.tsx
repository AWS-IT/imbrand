import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
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
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return products.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
  }))
}

async function getNewProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
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
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return products.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
  }))
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      products: {
        some: {
          isActive: true,
        },
      },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    take: 4,
  })

  return categories
}

export default async function HomePage() {
  const [featuredProducts, newProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
    getCategories(),
  ])

  return (
    <div>
      {/* Hero секция */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-6xl font-display font-semibold text-white mb-6 leading-tight">
              Элегантность в каждой детали
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Откройте для себя коллекцию премиальной женской одежды, созданной для тех, кто ценит стиль и качество.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-[#0a0a0a] hover:bg-gray-100">
                <Link href="/catalog">
                  Смотреть каталог
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/catalog/new">Новая коллекция</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-center mb-12">
              Категории
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/catalog/${category.slug}`}
                  className="group relative aspect-square rounded-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-600" />
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <h3 className="text-lg md:text-xl font-semibold text-center mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-200">
                      {category._count.products} товаров
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Избранные товары */}
      {featuredProducts.length > 0 && (
        <div className="container mx-auto px-4">
          <ProductGrid
            products={featuredProducts}
            title="Избранное"
            showMoreLink="/catalog"
          />
        </div>
      )}

      {/* Баннер */}
      <section className="py-16 bg-[#0a0a0a] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-6">
              Бесплатная доставка
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              При заказе от 10 000 ₽ доставка по всей России бесплатно.
              Оформите заказ сегодня и получите его в кратчайшие сроки.
            </p>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0a0a0a]">
              <Link href="/delivery">Узнать больше</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Новинки */}
      {newProducts.length > 0 && (
        <div className="container mx-auto px-4">
          <ProductGrid
            products={newProducts}
            title="Новинки"
            showMoreLink="/catalog/new"
          />
        </div>
      )}

      {/* Преимущества */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">
                Доставляем заказы по всей России в кратчайшие сроки
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Гарантия качества</h3>
              <p className="text-gray-600">
                Только качественные материалы и безупречный пошив
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Простой возврат</h3>
              <p className="text-gray-600">
                14 дней на возврат товара надлежащего качества
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
