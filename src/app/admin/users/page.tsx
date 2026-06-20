import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Shield, UserCog } from 'lucide-react'

async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users
}

export const metadata = {
  title: 'Пользователи — Админ-панель',
}

export default async function AdminUsersPage() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Пользователи</h1>
          <p className="text-gray-500 mt-1">Управление пользователями магазина</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{users.length} пользователей</span>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Заказы</TableHead>
              <TableHead>Отзывы</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || ''}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.name || 'Без имени'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.role === 'ADMIN' ? (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      <Shield className="h-3 w-3 mr-1" />
                      Админ
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Пользователь</Badge>
                  )}
                </TableCell>
                <TableCell>{user._count.orders}</TableCell>
                <TableCell>{user._count.reviews}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/users/${user.id}`}>
                      <UserCog className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
