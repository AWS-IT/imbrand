import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadProductImage, deleteImage } from '@/lib/cloudinary'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Обновление товара
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const { id } = await params

  try {
    const formData = await request.formData()
    const dataString = formData.get('data') as string
    const data = JSON.parse(dataString)

    // Получаем текущий товар
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    })

    if (!currentProduct) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    // Проверяем уникальность slug (если изменился)
    if (data.slug !== currentProduct.slug) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: data.slug },
      })

      if (existingProduct) {
        return NextResponse.json(
          { error: 'Товар с таким URL уже существует' },
          { status: 400 }
        )
      }
    }

    // Собираем существующие изображения, которые нужно сохранить
    const existingImageIds: string[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('existing_')) {
        existingImageIds.push(value as string)
      }
    }

    // Удаляем изображения, которые не в списке существующих
    const imagesToDelete = currentProduct.images.filter(
      (img) => !existingImageIds.includes(img.id)
    )

    for (const img of imagesToDelete) {
      if (img.publicId) {
        await deleteImage(img.publicId)
      }
    }

    // Загружаем новые изображения
    const newImages: { url: string; publicId: string; position: number }[] = []
    let position = existingImageIds.length

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        const buffer = await value.arrayBuffer()
        const base64 = `data:${value.type};base64,${Buffer.from(buffer).toString('base64')}`

        const result = await uploadProductImage(base64)
        newImages.push({
          url: result.url,
          publicId: result.publicId,
          position: position++,
        })
      }
    }

    // Обновляем товар в транзакции
    await prisma.$transaction(async (tx) => {
      // Удаляем старые изображения
      await tx.productImage.deleteMany({
        where: {
          productId: id,
          id: { notIn: existingImageIds },
        },
      })

      // Добавляем новые изображения
      if (newImages.length > 0) {
        await tx.productImage.createMany({
          data: newImages.map((img) => ({
            ...img,
            productId: id,
          })),
        })
      }

      // Удаляем старые варианты
      await tx.productVariant.deleteMany({
        where: { productId: id },
      })

      // Создаём новые варианты
      await tx.productVariant.createMany({
        data: data.variants.map((v: any) => ({
          productId: id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: v.stock || 0,
          sku: v.sku || null,
        })),
      })

      // Обновляем товар
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          price: data.price,
          oldPrice: data.oldPrice || null,
          categoryId: data.categoryId || null,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка обновления товара:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления товара' },
      { status: 500 }
    )
  }
}

// Удаление товара
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const { id } = await params

  try {
    // Получаем изображения для удаления из Cloudinary
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    // Удаляем изображения из Cloudinary
    for (const img of product.images) {
      if (img.publicId) {
        await deleteImage(img.publicId)
      }
    }

    // Удаляем товар (каскадно удалятся изображения и варианты)
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления товара:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления товара' },
      { status: 500 }
    )
  }
}
