import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Plus, Edit, Eye, EyeOff } from 'lucide-react'

async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      category: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return products.map(p => ({
    ...p,
    price: Number(p.price),
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
  }))
}

export const metadata = {
  title: 'Товары — Админ Imbrand',
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Товары</h1>
          <p className="text-gray-500 mt-1">
            Всего товаров: {products.length}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Товаров пока нет</p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый товар
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Изображение */}
                  <div className="relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                        Нет фото
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      {product.isActive ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Eye className="h-3 w-3 mr-1" />
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Скрыт
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge>Избранное</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {product.category?.name || 'Без категории'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Остаток: {product.totalStock} шт.
                      </span>
                      <span className="text-sm text-gray-500">
                        Вариантов: {product.variants.length}
                      </span>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/${product.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Редактировать
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/product/${product.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
