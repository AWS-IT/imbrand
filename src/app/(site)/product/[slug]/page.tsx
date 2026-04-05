import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductClient } from './ProductClient'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      variants: {
        where: { stock: { gt: 0 } },
        orderBy: [{ size: 'asc' }, { color: 'asc' }],
      },
      category: true,
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return product
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'Товар не найден — Imbrand' }
  }

  return {
    title: `${product.name} — Imbrand`,
    description: product.description || `Купить ${product.name} в интернет-магазине Imbrand`,
    openGraph: {
      title: `${product.name} — Imbrand`,
      description: product.description || `Купить ${product.name} в интернет-магазине Imbrand`,
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Подсчитываем средний рейтинг
  const reviewCount = product.reviews.length
  const averageRating = reviewCount > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0

  // Преобразуем данные для клиентского компонента
  const productData = {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    reviews: product.reviews.map(r => ({
      ...r,
      createdAt: r.createdAt,
    })),
  }

  return (
    <ProductClient
      product={productData}
      averageRating={averageRating}
      reviewCount={reviewCount}
    />
  )
}
