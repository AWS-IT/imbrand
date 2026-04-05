import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
  searchParams: Promise<{
    sort?: string
  }>
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: true,
    },
  })
  return category
}

async function getProducts(categorySlug: string, sort: string = 'newest') {
  const orderBy = {
    newest: { createdAt: 'desc' as const },
    oldest: { createdAt: 'asc' as const },
    price_asc: { price: 'asc' as const },
    price_desc: { price: 'desc' as const },
  }[sort] || { createdAt: 'desc' as const }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        slug: categorySlug,
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
    orderBy,
  })

  return products.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
  }))
}

async function getAllCategories() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })
  return categories
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = await getCategory(categorySlug)

  if (!category) {
    return { title: 'Категория не найдена — Imbrand' }
  }

  return {
    title: `${category.name} — Imbrand`,
    description: category.description || `Купить ${category.name.toLowerCase()} в интернет-магазине Imbrand`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: categorySlug } = await params
  const { sort } = await searchParams

  const [category, products, allCategories] = await Promise.all([
    getCategory(categorySlug),
    getProducts(categorySlug, sort),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-gray-900">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Сайдбар с категориями */}
        <aside className="lg:w-64 flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Категории</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/catalog"
                className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-100"
              >
                Все товары
              </Link>
            </li>
            {allCategories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/catalog/${cat.slug}`}
                  className={`block py-2 text-sm transition-colors border-b border-gray-100 ${
                    cat.slug === categorySlug
                      ? 'font-medium text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                  <span className="text-gray-400 ml-2">
                    ({cat._count.products})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Основной контент */}
        <div className="flex-1">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-semibold mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>

          {/* Товары */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
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
              <p className="text-gray-500">В этой категории пока нет товаров</p>
              <Link href="/catalog" className="text-sm text-gray-900 underline mt-2 inline-block">
                Посмотреть все товары
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
