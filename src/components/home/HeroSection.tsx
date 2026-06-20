'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  images: { url: string }[]
}

interface HeroSectionProps {
  products: Product[]
}

export function HeroSection({ products }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get 3 products for display (or fill with placeholders)
  const displayProducts = products.slice(0, 3)

  const nextSlide = useCallback(() => {
    if (displayProducts.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % displayProducts.length)
    }
  }, [displayProducts.length])

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (displayProducts.length <= 1) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide, displayProducts.length])

  // Reorder products for display: current in front, others behind
  const getProductOrder = () => {
    if (displayProducts.length === 0) return []
    if (displayProducts.length === 1) return [{ product: displayProducts[0], position: 'center' as const }]
    if (displayProducts.length === 2) {
      return [
        { product: displayProducts[(currentIndex + 1) % 2], position: 'back-left' as const },
        { product: displayProducts[currentIndex], position: 'center' as const },
      ]
    }
    return [
      { product: displayProducts[(currentIndex + 2) % 3], position: 'back-left' as const },
      { product: displayProducts[(currentIndex + 1) % 3], position: 'back-right' as const },
      { product: displayProducts[currentIndex], position: 'center' as const },
    ]
  }

  const orderedProducts = getProductOrder()

  return (
    <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-white leading-tight">
              Элегантность
              <span className="block text-amber-200">каждой детали</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-300 max-w-lg mx-auto lg:mx-0">
              Откройте для себя коллекцию премиальной женской одежды, созданную для тех, кто ценит стиль и качество
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-neutral-900 border-neutral-500 hover:bg-neutral-200 text-neutral-900 px-8">
                <Link href="/catalog">
                  Посмотреть каталог
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-neutral-500 text-black hover:bg-neutral-800">
                <Link href="/catalog/new">
                  Новинки
                </Link>
              </Button>
            </div>
          </div>

          {/* Right side - Stacked product images */}
          <div className="relative h-[350px] md:h-[400px] lg:h-[450px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {orderedProducts.map(({ product, position }, index) => {
                  const positionStyles = {
                    'back-left': {
                      x: '-30%',
                      y: '5%',
                      scale: 0.75,
                      zIndex: 1,
                      rotate: -8,
                    },
                    'back-right': {
                      x: '30%',
                      y: '5%',
                      scale: 0.75,
                      zIndex: 1,
                      rotate: 8,
                    },
                    'center': {
                      x: '0%',
                      y: '0%',
                      scale: 1,
                      zIndex: 10,
                      rotate: 0,
                    },
                  }

                  const style = positionStyles[position]

                  return (
                    <motion.div
                      key={`${product.id}-${position}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: position === 'center' ? 1 : 0.6,
                        scale: style.scale,
                        x: style.x,
                        y: style.y,
                        rotate: style.rotate,
                        zIndex: style.zIndex,
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="absolute"
                      style={{ zIndex: style.zIndex }}
                    >
                      <Link href={`/product/${product.slug}`} className="block">
                        <div className={`
                          relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10
                          ${position === 'center'
                            ? 'w-[220px] h-[300px] md:w-[260px] md:h-[350px]'
                            : 'w-[180px] h-[240px] md:w-[200px] md:h-[270px]'
                          }
                        `}>
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                              <span className="text-white/50 text-sm">Нет фото</span>
                            </div>
                          )}
                          {position === 'center' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Dots indicator */}
            {displayProducts.length > 1 && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                {displayProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-amber-200 w-6'
                        : 'bg-neutral-600 hover:bg-neutral-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
    </section>
  )
}
