import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'

async function getWishlistItems(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            orderBy: { position: 'asc' },
            take: 1,
          },
          variants: {
            where: { stock: { gt: 0 } },
          },
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return items.map(item => ({
    ...item,
    product: {
      ...item.product,
      price: Number(item.product.price),
      oldPrice: item.product.oldPrice ? Number(item.product.oldPrice) : null,
    },
  }))
}

export const metadata = {
  title: 'Избранное — Imbrand',
}

export default async function WishlistPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/wishlist')
  }

  const wishlistItems = await getWishlistItems(session.user.id)

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-display font-semibold mb-4">
            Список желаний пуст
          </h1>
          <p className="text-gray-500 mb-8">
            Добавляйте товары в избранное, чтобы не потерять их
          </p>
          <Button asChild size="lg">
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-8">
        Избранное
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlistItems.map((item) => {
          const hasDiscount = item.product.oldPrice && item.product.oldPrice > item.product.price
          const isInStock = item.product.variants.length > 0

          return (
            <div key={item.id} className="group relative">
              <Link href={`/product/${item.product.slug}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-4">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Нет фото
                    </div>
                  )}

                  {!isInStock && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">Нет в наличии</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {item.product.category && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {item.product.category.name}
                    </p>
                  )}
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                    {item.product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatPrice(item.product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(item.product.oldPrice!)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Кнопки действий */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <form action="/api/wishlist/remove" method="POST">
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="Удалить из избранного"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </form>

                {isInStock && (
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="В корзину"
                  >
                    <ShoppingBag className="h-4 w-4 text-gray-600" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
