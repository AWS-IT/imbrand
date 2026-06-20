import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadProductImage } from '@/lib/upload'

// Создание товара
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const dataString = formData.get('data') as string
    const data = JSON.parse(dataString)

    // Проверяем уникальность slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Товар с таким URL уже существует' },
        { status: 400 }
      )
    }

    // Загружаем изображения
    const images: { url: string; publicId: string; position: number }[] = []
    let position = 0

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        try {
          // Конвертируем файл в base64
          const buffer = await value.arrayBuffer()
          const base64 = `data:${value.type};base64,${Buffer.from(buffer).toString('base64')}`

          const result = await uploadProductImage(base64)
          images.push({
            url: result.url,
            publicId: result.publicId,
            position: position++,
          })
        } catch (uploadError) {
          console.error('Ошибка загрузки изображения:', uploadError)
          const message = uploadError instanceof Error ? uploadError.message : 'Ошибка загрузки изображения'
          return NextResponse.json(
            { error: message },
            { status: 500 }
          )
        }
      }
    }

    // Создаём товар
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        oldPrice: data.oldPrice || null,
        categoryId: data.categoryId || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        images: {
          create: images,
        },
        variants: {
          create: data.variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || null,
            stock: v.stock || 0,
            sku: v.sku || null,
          })),
        },
      },
    })

    return NextResponse.json({ success: true, productId: product.id })
  } catch (error) {
    console.error('Ошибка создания товара:', error)
    return NextResponse.json(
      { error: 'Ошибка создания товара' },
      { status: 500 }
    )
  }
}
