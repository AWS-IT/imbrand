'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CartItem, Product, ProductImage, ProductVariant } from '@prisma/client'

type CartItemWithRelations = CartItem & {
  product: Product & { images: ProductImage[] }
  variant: ProductVariant
}

// Добавление товара в корзину
export async function addToCart(productId: string, variantId: string, quantity: number = 1) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    // Проверяем наличие варианта
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    })

    if (!variant || variant.stock < quantity) {
      return { error: 'Недостаточно товара на складе' }
    }

    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId,
        },
      },
    })

    if (existingItem) {
      // Обновляем количество
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > variant.stock) {
        return { error: 'Недостаточно товара на складе' }
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Создаём новый элемент корзины
      await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId,
          quantity,
        },
      })
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error)
    return { error: 'Ошибка добавления в корзину' }
  }
}

// Обновление количества в корзине
export async function updateCartItem(itemId: string, quantity: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: true },
    })

    if (!item || item.userId !== session.user.id) {
      return { error: 'Товар не найден' }
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } })
    } else {
      if (quantity > item.variant.stock) {
        return { error: 'Недостаточно товара на складе' }
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      })
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления корзины:', error)
    return { error: 'Ошибка обновления корзины' }
  }
}

// Удаление товара из корзины
export async function removeFromCart(itemId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
    })

    if (!item || item.userId !== session.user.id) {
      return { error: 'Товар не найден' }
    }

    await prisma.cartItem.delete({ where: { id: itemId } })

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления из корзины:', error)
    return { error: 'Ошибка удаления из корзины' }
  }
}

// Очистка корзины
export async function clearCart() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Ошибка очистки корзины:', error)
    return { error: 'Ошибка очистки корзины' }
  }
}

// Получение корзины
export async function getCart() {
  const session = await auth()
  if (!session?.user?.id) {
    return { items: [], total: 0 }
  }

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
        variant: true,
      },
    })

    const total = items.reduce(
      (sum: number, item: CartItemWithRelations) => sum + Number(item.product.price) * item.quantity,
      0
    )

    return {
      items: items.map((item: CartItemWithRelations) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      })),
      total,
    }
  } catch (error) {
    console.error('Ошибка получения корзины:', error)
    return { items: [], total: 0 }
  }
}
