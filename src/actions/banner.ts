'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uploadBannerImage, deleteImage } from '@/lib/upload'

// Dynamic import to workaround TypeScript caching issues
async function getDb() {
  const { PrismaClient } = await import('@prisma/client')
  return new PrismaClient()
}

export async function createBanner(data: {
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  imageUrl?: string
  imageBase64?: string
  imagePublicId?: string
  isActive?: boolean
  position?: number
}) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    let imageUrl = data.imageUrl
    let imagePublicId = data.imagePublicId

    // Если передан base64, загружаем изображение
    if (data.imageBase64) {
      const uploadResult = await uploadBannerImage(data.imageBase64)
      imageUrl = uploadResult.url
      imagePublicId = uploadResult.publicId
    }

    if (!imageUrl) {
      return { error: 'Изображение обязательно' }
    }

    const db = await getDb()
    const banner = await (db as any).banner.create({
      data: {
        title: data.title || null,
        subtitle: data.subtitle || null,
        buttonText: data.buttonText || null,
        buttonLink: data.buttonLink || null,
        imageUrl: imageUrl,
        imagePublicId: imagePublicId || null,
        isActive: data.isActive ?? true,
        position: data.position ?? 0,
      },
    })

    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true, banner }
  } catch (error) {
    console.error('Ошибка создания баннера:', error)
    const message = error instanceof Error ? error.message : 'Ошибка создания баннера'
    return { error: message }
  }
}

export async function updateBanner(
  id: string,
  data: {
    title?: string | null
    subtitle?: string | null
    buttonText?: string | null
    buttonLink?: string | null
    imageUrl?: string
    imageBase64?: string
    imagePublicId?: string | null
    isActive?: boolean
    position?: number
  }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    const db = await getDb()

    // Получаем текущий баннер
    const currentBanner = await (db as any).banner.findUnique({ where: { id } })

    let imageUrl = data.imageUrl
    let imagePublicId = data.imagePublicId

    // Если передан новый base64, загружаем изображение
    if (data.imageBase64) {
      // Удаляем старое изображение
      if (currentBanner?.imagePublicId) {
        await deleteImage(currentBanner.imagePublicId)
      }

      const uploadResult = await uploadBannerImage(data.imageBase64)
      imageUrl = uploadResult.url
      imagePublicId = uploadResult.publicId
    }

    const updateData: any = { ...data }
    delete updateData.imageBase64
    if (imageUrl) updateData.imageUrl = imageUrl
    if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId

    const banner = await (db as any).banner.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true, banner }
  } catch (error) {
    console.error('Ошибка обновления баннера:', error)
    const message = error instanceof Error ? error.message : 'Ошибка обновления баннера'
    return { error: message }
  }
}

export async function deleteBanner(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    const db = await getDb()

    // Получаем баннер для удаления изображения
    const banner = await (db as any).banner.findUnique({ where: { id } })
    if (banner?.imagePublicId) {
      await deleteImage(banner.imagePublicId)
    }

    await (db as any).banner.delete({
      where: { id },
    })

    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления баннера:', error)
    return { error: 'Ошибка удаления баннера' }
  }
}

export async function toggleBannerActive(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    const db = await getDb()
    const banner = await (db as any).banner.findUnique({ where: { id } })
    if (!banner) {
      return { error: 'Баннер не найден' }
    }

    await (db as any).banner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    })

    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Ошибка переключения статуса:', error)
    return { error: 'Ошибка переключения статуса' }
  }
}
