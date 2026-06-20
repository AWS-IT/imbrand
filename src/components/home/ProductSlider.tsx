'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number | null
  images: { url: string }[]
  category?: { name: string } | null
}

interface ProductSliderProps {
  products: Product[]
  title?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  slidesPerView?: number
}

export function ProductSlider({
  products,
  title,
  autoPlay = true,
  autoPlayInterval = 4000,
  slidesPerView = 4,
}: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate max index based on slides per view
  const maxIndex = Math.max(0, products.length - slidesPerView)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isHovered || products.length <= slidesPerView) return

    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isHovered, nextSlide, products.length, slidesPerView])

  if (products.length === 0) return null

  const showControls = products.length > slidesPerView

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Buttons */}
      {showControls && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hidden md:flex"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hidden md:flex"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Slider Container */}
      <div ref={containerRef} className="overflow-hidden">
        <motion.div
          className="flex gap-4 md:gap-6"
          animate={{ x: `calc(-${currentIndex * (100 / slidesPerView)}% - ${currentIndex * (slidesPerView > 1 ? 24 / slidesPerView : 0)}px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group block flex-shrink-0"
              style={{ width: `calc(${100 / slidesPerView}% - ${(slidesPerView - 1) * 24 / slidesPerView}px)` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Нет фото
                  </div>
                )}
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
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
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      {showControls && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                currentIndex === index ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
