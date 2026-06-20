'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadCategoryImage, deleteImage } from '@/lib/upload'

export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  image?: string
  imageBase64?: string
  parentId?: string
}) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    let imageUrl = data.image

    // Если передан base64, загружаем изображение
    if (data.imageBase64) {
      const uploadResult = await uploadCategoryImage(data.imageBase64)
      imageUrl = uploadResult.url
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: imageUrl || null,
        parentId: data.parentId || null,
      },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/catalog')
    revalidatePath('/')
    return { success: true, category }
  } catch (error) {
    console.error('Ошибка создания категории:', error)
    const message = error instanceof Error ? error.message : 'Ошибка создания категории'
    return { error: message }
  }
}

export async function updateCategory(
  id: string,
  data: {
    name?: string
    slug?: string
    description?: string
    image?: string
    imageBase64?: string
    parentId?: string | null
  }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    // Получаем текущую категорию
    const currentCategory = await prisma.category.findUnique({ where: { id } })

    let imageUrl = data.image

    // Если передан новый base64, загружаем изображение
    if (data.imageBase64) {
      // Удаляем старое изображение если оно локальное
      if (currentCategory?.image?.startsWith('/uploads/')) {
        const oldFilename = currentCategory.image.split('/').pop()
        if (oldFilename) {
          await deleteImage(oldFilename)
        }
      }

      const uploadResult = await uploadCategoryImage(data.imageBase64)
      imageUrl = uploadResult.url
    }

    const updateData: any = { ...data }
    delete updateData.imageBase64
    if (imageUrl !== undefined) updateData.image = imageUrl

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/admin/categories')
    revalidatePath('/catalog')
    revalidatePath('/')
    return { success: true, category }
  } catch (error) {
    console.error('Ошибка обновления категории:', error)
    const message = error instanceof Error ? error.message : 'Ошибка обновления категории'
    return { error: message }
  }
}

export async function deleteCategory(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    // Проверяем, есть ли товары в категории
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    })

    if (productsCount > 0) {
      return { error: `Нельзя удалить категорию с товарами (${productsCount} шт.)` }
    }

    // Проверяем, есть ли подкатегории
    const subcategoriesCount = await prisma.category.count({
      where: { parentId: id },
    })

    if (subcategoriesCount > 0) {
      return { error: `Сначала удалите подкатегории (${subcategoriesCount} шт.)` }
    }

    // Получаем категорию для удаления изображения
    const category = await prisma.category.findUnique({ where: { id } })

    // Удаляем изображение если оно локальное
    if (category?.image?.startsWith('/uploads/')) {
      const filename = category.image.split('/').pop()
      if (filename) {
        await deleteImage(filename)
      }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/catalog')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления категории:', error)
    return { error: 'Ошибка удаления категории' }
  }
}
