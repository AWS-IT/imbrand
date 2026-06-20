import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadImage } from '@/lib/upload'

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
  }

  try {
    const { image, folder = 'images' } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'Изображение не предоставлено' },
        { status: 400 }
      )
    }

    const result = await uploadImage(image, { folder })

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.filename,
    })
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    const message = error instanceof Error ? error.message : 'Ошибка загрузки изображения'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
