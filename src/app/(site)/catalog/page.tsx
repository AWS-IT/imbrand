import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/product/ProductCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface CatalogPageProps {
  searchParams: Promise<{
    sort?: string
    page?: string
  }>
}

async function getProducts(sort: string = 'newest') {
  const orderBy = {
    newest: { createdAt: 'desc' as const },
    oldest: { createdAt: 'asc' as const },
    price_asc: { price: 'asc' as const },
    price_desc: { price: 'desc' as const },
  }[sort] || { createdAt: 'desc' as const }

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
    orderBy,
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
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return categories
}

export const metadata = {
  title: 'Каталог — Imbrand',
  description: 'Полный каталог женской одежды Imbrand',
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const sort = params.sort || 'newest'

  const [products, categories] = await Promise.all([
    getProducts(sort),
    getCategories(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Каталог</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Сайдбар с категориями */}
        <aside className="lg:w-64 flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Категории</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/catalog"
                className="block py-2 text-sm font-medium text-gray-900 border-b border-gray-200"
              >
                Все товары
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/catalog/${category.slug}`}
                  className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-100"
                >
                  {category.name}
                  <span className="text-gray-400 ml-2">
                    ({category._count.products})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Основной контент */}
        <div className="flex-1">
          {/* Заголовок и сортировка */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-semibold">
              Все товары
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Сортировка:</span>
              <Select defaultValue={sort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <Link href="/catalog?sort=newest" className="block w-full">
                      Сначала новые
                    </Link>
                  </SelectItem>
                  <SelectItem value="price_asc">
                    <Link href="/catalog?sort=price_asc" className="block w-full">
                      Сначала дешевле
                    </Link>
                  </SelectItem>
                  <SelectItem value="price_desc">
                    <Link href="/catalog?sort=price_desc" className="block w-full">
                      Сначала дороже
                    </Link>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Товары */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-4">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {product.category && (
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {product.category.name}
                      </p>
                    )}
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {new Intl.NumberFormat('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                          minimumFractionDigits: 0,
                        }).format(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            minimumFractionDigits: 0,
                          }).format(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Товары не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
