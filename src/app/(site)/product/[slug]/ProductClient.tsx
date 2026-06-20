'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ChevronLeft, ChevronRight, Star, Minus, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, formatPrice } from '@/lib/utils'
import { addToCart } from '@/actions/cart'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { useToast } from '@/hooks/use-toast'

interface ProductVariant {
  id: string
  size: string
  color: string
  colorHex?: string | null
  stock: number
}

interface ProductImage {
  id: string
  url: string
  position: number
}

interface Review {
  id: string
  rating: number
  text: string | null
  createdAt: Date
  user: {
    name: string | null
  }
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  oldPrice?: number | null
  images: ProductImage[]
  variants: ProductVariant[]
  reviews: Review[]
  category?: {
    name: string
    slug: string
  } | null
}

interface ProductClientProps {
  product: Product
  averageRating: number
  reviewCount: number
  isInWishlist?: boolean
}

export function ProductClient({ product, averageRating, reviewCount, isInWishlist = false }: ProductClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Получаем уникальные размеры и цвета с наличием
  const availableSizes = Array.from(new Set(product.variants.filter(v => v.stock > 0).map(v => v.size)))
  const availableColors = Array.from(new Set(product.variants.filter(v => v.stock > 0).map(v => v.color)))

  // Получаем выбранный вариант
  const selectedVariant = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor && v.stock > 0
  )

  // Проверяем наличие для конкретного размера и цвета
  const isVariantAvailable = (size: string, color: string) => {
    return product.variants.some(v => v.size === size && v.color === color && v.stock > 0)
  }

  // Обработка добавления в корзину
  const handleAddToCart = async () => {
    if (!selectedVariant) return

    setIsAddingToCart(true)
    try {
      const result = await addToCart(product.id, selectedVariant.id, quantity)

      if (result.error) {
        toast({
          title: 'Ошибка',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Добавлено в корзину',
        description: `${product.name} (${selectedVariant.size}, ${selectedVariant.color})`,
      })
      router.refresh()
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину',
        variant: 'destructive',
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0

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
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/catalog/${product.category.slug}`} className="hover:text-gray-900">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Галерея изображений */}
        <div className="space-y-4">
          {/* Главное изображение */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
            {product.images[selectedImageIndex] ? (
              <Image
                src={product.images[selectedImageIndex].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Нет фото
              </div>
            )}

            {/* Скидка */}
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-lg px-3 py-1">
                -{discountPercent}%
              </Badge>
            )}

            {/* Навигация по изображениям */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Миниатюры */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors',
                    selectedImageIndex === index ? 'border-[#0a0a0a]' : 'border-transparent'
                  )}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} - фото ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="space-y-6">
          {/* Категория */}
          {product.category && (
            <Link
              href={`/catalog/${product.category.slug}`}
              className="text-sm text-gray-500 uppercase tracking-wider hover:text-gray-900"
            >
              {product.category.name}
            </Link>
          )}

          {/* Название */}
          <h1 className="text-2xl md:text-3xl font-display font-semibold">
            {product.name}
          </h1>

          {/* Рейтинг */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {averageRating.toFixed(1)} ({reviewCount} отзывов)
              </span>
            </div>
          )}

          {/* Цена */}
          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.oldPrice!)}
              </span>
            )}
          </div>

          <Separator />

          {/* Выбор цвета */}
          {availableColors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Цвет</span>
                {selectedColor && (
                  <span className="text-sm text-gray-500">{selectedColor}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const variant = product.variants.find(v => v.color === color)
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'px-4 py-2 text-sm border rounded-md transition-colors',
                        selectedColor === color
                          ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      )}
                    >
                      {variant?.colorHex && (
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                      )}
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Выбор размера */}
          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Размер</span>
                <Link href="/size-guide" className="text-sm text-gray-500 underline">
                  Таблица размеров
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const isAvailable = availableSizes.includes(size) &&
                    (!selectedColor || isVariantAvailable(size, selectedColor))
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={cn(
                        'w-12 h-12 text-sm border rounded-md transition-colors',
                        !isAvailable && 'opacity-30 cursor-not-allowed line-through',
                        selectedSize === size
                          ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Количество */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Количество</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 10, q + 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {selectedVariant && (
                <span className="text-sm text-gray-500">
                  В наличии: {selectedVariant.stock} шт.
                </span>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              disabled={!selectedVariant || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ShoppingBag className="h-5 w-5 mr-2" />
              )}
              {isAddingToCart ? 'Добавляем...' : 'Добавить в корзину'}
            </Button>
            <WishlistButton
              productId={product.id}
              isInWishlist={isInWishlist}
              className="p-4 border rounded-md hover:bg-gray-50"
            />
          </div>

          {!selectedSize && !selectedColor && (
            <p className="text-sm text-amber-600">
              Выберите размер и цвет для добавления в корзину
            </p>
          )}

          <Separator />

          {/* Описание */}
          {product.description && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Описание</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Отзывы */}
      {product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-display font-semibold mb-6">
            Отзывы ({reviewCount})
          </h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.user.name || 'Покупатель'}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                {review.text && (
                  <p className="text-gray-600">{review.text}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
