'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Добавление в избранное
export async function addToWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    // Проверяем, не добавлен ли уже товар
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existing) {
      return { success: true, message: 'Товар уже в избранном' }
    }

    await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath('/wishlist')
    return { success: true }
  } catch (error) {
    console.error('Ошибка добавления в избранное:', error)
    return { error: 'Ошибка добавления в избранное' }
  }
}

// Удаление из избранного
export async function removeFromWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    revalidatePath('/wishlist')
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error)
    return { error: 'Ошибка удаления из избранного' }
  }
}

// Переключение избранного
export async function toggleWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      })
      revalidatePath('/wishlist')
      return { success: true, added: false }
    }

    await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath('/wishlist')
    return { success: true, added: true }
  } catch (error) {
    console.error('Ошибка переключения избранного:', error)
    return { error: 'Ошибка' }
  }
}

// Проверка, добавлен ли товар в избранное
export async function isInWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return false
  }

  try {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    return !!item
  } catch {
    return false
  }
}
