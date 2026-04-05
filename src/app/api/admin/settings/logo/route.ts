import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadLogo, deleteImage } from '@/lib/cloudinary'

// Загрузка логотипа
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
  }

  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'Изображение не передано' }, { status: 400 })
    }

    // Получаем текущие настройки
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    // Удаляем старый логотип
    if (settings?.logoPublicId) {
      await deleteImage(settings.logoPublicId)
    }

    // Загружаем новый
    const result = await uploadLogo(image)

    // Сохраняем
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

    return NextResponse.json({ success: true, url: result.url })
  } catch (error) {
    console.error('Ошибка загрузки логотипа:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки логотипа' },
      { status: 500 }
    )
  }
}

// Удаление логотипа
export async function DELETE() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления логотипа:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления логотипа' },
      { status: 500 }
    )
  }
}
