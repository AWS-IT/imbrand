import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  Tags,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const adminNavItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Категории', icon: Tags },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Проверка авторизации и роли администратора
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Сайдбар */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0a0a0a] text-white">
        {/* Логотип */}
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link href="/admin" className="flex items-center">
            <span className="font-display text-xl font-semibold">Imbrand</span>
            <span className="ml-2 text-xs text-gray-400">Админ</span>
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex flex-col gap-1 p-4">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Нижняя часть */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4">
          <div className="mb-4 text-sm">
            <p className="text-gray-400">Вы вошли как:</p>
            <p className="font-medium">{session.user.name || session.user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white">
              <Link href="/">На сайт</Link>
            </Button>
            <form
              action={async () => {
                'use server'
                const { signOut } = await import('@/lib/auth')
                await signOut({ redirectTo: '/login' })
              }}
            >
              <Button type="submit" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="ml-64">
        <div className="min-h-screen p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
