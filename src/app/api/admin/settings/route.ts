import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
  }

  try {
    const data = await request.json()

    await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        siteName: data.siteName,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        contactAddress: data.contactAddress || null,
        instagramUrl: data.instagramUrl || null,
        telegramUrl: data.telegramUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        deliveryInfo: data.deliveryInfo || null,
      },
      create: {
        id: 'main',
        siteName: data.siteName || 'Imbrand',
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        contactAddress: data.contactAddress || null,
        instagramUrl: data.instagramUrl || null,
        telegramUrl: data.telegramUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        deliveryInfo: data.deliveryInfo || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
    return NextResponse.json(
      { error: 'Ошибка сохранения настроек' },
      { status: 500 }
    )
  }
}
