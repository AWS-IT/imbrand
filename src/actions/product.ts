'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { deleteImage, isLocalUpload } from '@/lib/upload'

export async function searchProducts(query: string, limit: number = 10) {
  if (!query || query.trim().length < 2) {
    return { products: [] }
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
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
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        image: p.images[0]?.url || null,
        category: p.category?.name || null,
      })),
    }
  } catch (error) {
    console.error('Ошибка поиска:', error)
    return { products: [], error: 'Ошибка поиска' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Получаем товар с изображениями
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
      },
    })

    if (!product) {
      return { error: 'Товар не найден' }
    }

    // Удаляем локальные изображения
    for (const image of product.images) {
      if (isLocalUpload(image.url)) {
        await deleteImage(image.url)
      }
    }

    // Удаляем товар (каскадно удалятся изображения и варианты)
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidatePath('/admin/products')
    revalidatePath('/catalog')

    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления товара:', error)
    return { error: 'Не удалось удалить товар' }
  }
}
