'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления роли:', error)
    return { error: 'Ошибка обновления роли' }
  }
}

export async function deleteUser(userId: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Недостаточно прав' }
  }

  // Не даём удалить себя
  if (session.user.id === userId) {
    return { error: 'Нельзя удалить свой аккаунт' }
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error)
    return { error: 'Ошибка удаления пользователя' }
  }
}
