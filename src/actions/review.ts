'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CreateReviewData {
  productId: string
  rating: number
  text?: string
}

// Создание отзыва
export async function createReview(data: CreateReviewData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  if (data.rating < 1 || data.rating > 5) {
    return { error: 'Рейтинг должен быть от 1 до 5' }
  }

  try {
    // Проверяем, не оставлял ли уже отзыв
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: data.productId,
        },
      },
    })

    if (existing) {
      return { error: 'Вы уже оставили отзыв на этот товар' }
    }

    await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: data.productId,
        rating: data.rating,
        text: data.text || null,
        isApproved: false, // Требует модерации
      },
    })

    revalidatePath(`/product/${data.productId}`)
    return { success: true, message: 'Отзыв отправлен на модерацию' }
  } catch (error) {
    console.error('Ошибка создания отзыва:', error)
    return { error: 'Ошибка создания отзыва' }
  }
}

// Обновление отзыва
export async function updateReview(reviewId: string, data: { rating?: number; text?: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review || review.userId !== session.user.id) {
      return { error: 'Отзыв не найден' }
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating ?? review.rating,
        text: data.text ?? review.text,
        isApproved: false, // Повторная модерация
      },
    })

    revalidatePath(`/product/${review.productId}`)
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления отзыва:', error)
    return { error: 'Ошибка обновления отзыва' }
  }
}

// Удаление отзыва
export async function deleteReview(reviewId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт' }
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return { error: 'Отзыв не найден' }
    }

    // Проверяем права (владелец или админ)
    if (review.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return { error: 'Нет доступа' }
    }

    await prisma.review.delete({ where: { id: reviewId } })

    revalidatePath(`/product/${review.productId}`)
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления отзыва:', error)
    return { error: 'Ошибка удаления отзыва' }
  }
}

// Одобрение отзыва (для админа)
export async function approveReview(reviewId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Нет доступа' }
  }

  try {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    })

    revalidatePath(`/product/${review.productId}`)
    revalidatePath('/admin/reviews')
    return { success: true }
  } catch (error) {
    console.error('Ошибка одобрения отзыва:', error)
    return { error: 'Ошибка одобрения отзыва' }
  }
}
