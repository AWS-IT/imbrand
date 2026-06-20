'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, cn } from '@/lib/utils'

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
  darkMode?: boolean
}

export function ProductCard({ product, index = 0, darkMode = false }: ProductCardProps) {
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / Number(product.oldPrice)) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-lg mb-3",
          darkMode ? "bg-neutral-800" : "bg-gray-100"
        )}>
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className={cn(
              "absolute inset-0 flex items-center justify-center text-sm",
              darkMode ? "text-neutral-500" : "text-gray-400"
            )}>
              Нет фото
            </div>
          )}

          {/* Скидка */}
          {hasDiscount && (
            <Badge className="absolute top-2.5 left-2.5 bg-rose-500 hover:bg-rose-500 text-xs px-2 py-0.5">
              -{discountPercent}%
            </Badge>
          )}

          {/* Кнопка в избранное */}
          <button
            onClick={(e) => {
              e.preventDefault()
            }}
            className={cn(
              "absolute top-2.5 right-2.5 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110",
              darkMode ? "bg-neutral-700 text-white" : "bg-white text-gray-600"
            )}
            aria-label="Добавить в избранное"
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Оверлей при наведении */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </div>

        {/* Информация о товаре */}
        <div className="space-y-1">
          {product.category && (
            <p className={cn(
              "text-[11px] uppercase tracking-wider",
              darkMode ? "text-neutral-500" : "text-gray-500"
            )}>
              {product.category.name}
            </p>
          )}
          <h3 className={cn(
            "text-sm font-medium transition-colors line-clamp-2 leading-snug",
            darkMode
              ? "text-white group-hover:text-neutral-300"
              : "text-gray-900 group-hover:text-gray-600"
          )}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 pt-0.5">
            <span className={cn(
              "text-sm font-semibold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className={cn(
                "text-xs line-through",
                darkMode ? "text-neutral-500" : "text-gray-400"
              )}>
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
  darkMode?: boolean
}

export function ProductGrid({ products, title, showMoreLink, darkMode = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={darkMode ? "text-neutral-500" : "text-gray-500"}>Товары не найдены</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className={cn(
            "text-2xl md:text-3xl font-display font-semibold",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            {title}
          </h2>
          {showMoreLink && (
            <Link
              href={showMoreLink}
              className={cn(
                "flex items-center text-sm font-medium transition-colors",
                darkMode
                  ? "text-neutral-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Смотреть все
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} darkMode={darkMode} />
        ))}
      </div>
    </div>
  )
}
