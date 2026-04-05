'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number | null
  images: { url: string }[]
  category?: { name: string } | null
}

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / Number(product.oldPrice)) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-4">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Нет фото
            </div>
          )}

          {/* Скидка */}
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500">
              -{discountPercent}%
            </Badge>
          )}

          {/* Кнопка в избранное */}
          <button
            onClick={(e) => {
              e.preventDefault()
              // TODO: добавить в избранное
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            aria-label="Добавить в избранное"
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Быстрый просмотр */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.preventDefault()
                // TODO: быстрый просмотр
              }}
            >
              Быстрый просмотр
            </Button>
          </div>
        </div>

        {/* Информация о товаре */}
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
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.oldPrice!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

interface ProductGridProps {
  products: Product[]
  title?: string
  showMoreLink?: string
}

export function ProductGrid({ products, title, showMoreLink }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Товары не найдены</p>
      </div>
    )
  }

  return (
    <section className="py-12 md:py-16">
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-semibold">
            {title}
          </h2>
          {showMoreLink && (
            <Link
              href={showMoreLink}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Смотреть все
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  )
}
