import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/product/ProductCard'
import { ArrowRight, Sparkles, Percent, Truck, Shield, RotateCcw } from 'lucide-react'
import { HeroSection } from '@/components/home/HeroSection'
import { ProductSlider } from '@/components/home/ProductSlider'

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
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      createdAt: { gte: thirtyDaysAgo },
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
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return products.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
  }))
}

async function getSaleProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      oldPrice: { not: null },
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
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return products
    .map(p => ({
      ...p,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    }))
    .filter(p => p.oldPrice && p.oldPrice > p.price)
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
  const [featuredProducts, newProducts, saleProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
    getSaleProducts(),
    getCategories(),
  ])

  return (
    <div>
      {/* Hero секция */}
      <HeroSection products={featuredProducts} />

      {/* Преимущества */}
      <section className="py-8 bg-neutral-900 border-b border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-800 rounded-full">
                <Truck className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Бесплатная доставка</p>
                <p className="text-xs text-neutral-400">от 10 000 ₽</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-800 rounded-full">
                <Shield className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Гарантия качества</p>
                <p className="text-xs text-neutral-400">100% оригинал</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-800 rounded-full">
                <RotateCcw className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Возврат 14 дней</p>
                <p className="text-xs text-neutral-400">без вопросов</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-800 rounded-full">
                <Shield className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Безопасная оплата</p>
                <p className="text-xs text-neutral-400">защита данных</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      {categories.length > 0 && (
        <section className="py-12 md:py-16 bg-neutral-950">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-white">
                Категории
              </h2>
              <Link
                href="/catalog"
                className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
              >
                Все категории <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/catalog/${category.slug}`}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden"
                >
                  {/* Gradient fallback - dark elegant colors */}
                  <div className={`absolute inset-0 ${
                    index % 4 === 0 ? 'bg-gradient-to-br from-rose-900 to-rose-950' :
                    index % 4 === 1 ? 'bg-gradient-to-br from-violet-900 to-violet-950' :
                    index % 4 === 2 ? 'bg-gradient-to-br from-amber-900 to-amber-950' :
                    'bg-gradient-to-br from-emerald-900 to-emerald-950'
                  }`} />
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <h3 className="text-lg md:text-xl font-semibold text-center mb-1 drop-shadow-md">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/80 drop-shadow">
                      {category._count.products} товаров
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Новинки */}
      {newProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-neutral-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-amber-400" />
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-white">
                  Горячие новинки
                </h2>
              </div>
              <Link
                href="/catalog/new"
                className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
              >
                Все новинки <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductGrid products={newProducts} darkMode />
          </div>
        </section>
      )}

      {/* Акции */}
      {saleProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-neutral-950">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-rose-500 rounded-full">
                  <Percent className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-white">
                  Акции
                </h2>
              </div>
              <Link
                href="/catalog/sale"
                className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
              >
                Все акции <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductGrid products={saleProducts} darkMode />
          </div>
        </section>
      )}

      {/* Избранные товары - слайдер */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-neutral-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-white">
                Популярные товары
              </h2>
              <Link
                href="/catalog"
                className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
              >
                Весь каталог <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductSlider
              products={featuredProducts}
              autoPlay={true}
              autoPlayInterval={5000}
              slidesPerView={4}
              //darkMode={}
            />
          </div>
        </section>
      )}
    </div>
  )
}
