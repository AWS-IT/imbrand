'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadLogo, deleteImage } from '@/lib/cloudinary'

interface UpdateSettingsData {
  siteName?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  instagramUrl?: string
  telegramUrl?: string
  metaTitle?: string
  metaDescription?: string
  deliveryInfo?: string
}

// Получение настроек
export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    // Создаём настройки если их нет
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'main' },
      })
    }

    return settings
  } catch (error) {
    console.error('Ошибка получения настроек:', error)
    return null
  }
}

// Обновление настроек
export async function updateSiteSettings(data: UpdateSettingsData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Нет доступа' }
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: data,
      create: {
        id: 'main',
        ...data,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления настроек:', error)
    return { error: 'Ошибка обновления настроек' }
  }
}

// Загрузка логотипа
export async function uploadSiteLogo(imageBase64: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Нет доступа' }
  }

  try {
    // Получаем текущие настройки
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    // Удаляем старый логотип если есть
    if (settings?.logoPublicId) {
      await deleteImage(settings.logoPublicId)
    }

    // Загружаем новый логотип
    const result = await uploadLogo(imageBase64)

    // Сохраняем URL и ID
    await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        logoUrl: result.url,
        logoPublicId: result.publicId,
      },
      create: {
        id: 'main',
        logoUrl: result.url,
        logoPublicId: result.publicId,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/settings')
    return { success: true, url: result.url }
  } catch (error) {
    console.error('Ошибка загрузки логотипа:', error)
    return { error: 'Ошибка загрузки логотипа' }
  }
}

// Удаление логотипа
export async function removeSiteLogo() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Нет доступа' }
  }

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    if (settings?.logoPublicId) {
      await deleteImage(settings.logoPublicId)
    }

    await prisma.siteSettings.update({
      where: { id: 'main' },
      data: {
        logoUrl: null,
        logoPublicId: null,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления логотипа:', error)
    return { error: 'Ошибка удаления логотипа' }
  }
}
