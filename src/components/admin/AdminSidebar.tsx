'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  Tags,
  LogOut,
  ImageIcon,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

const adminNavItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Категории', icon: Tags },
  { href: '/admin/banners', label: 'Баннеры', icon: ImageIcon },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

interface AdminSidebarProps {
  userName?: string | null
  userEmail?: string | null
}

export function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const SidebarContent = () => (
    <>
      {/* Логотип */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Link href="/admin" className="flex items-center" onClick={() => setIsOpen(false)}>
          <span className="ml-2 text-xl text-gray-400">Админ</span>
        </Link>
      </div>

      {/* Навигация */}
      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Нижняя часть */}
      <div className="border-t border-gray-800 p-4">
        <div className="mb-4 text-sm">
          <p className="text-gray-400">Вы вошли как:</p>
          <p className="font-medium truncate">{userName || userEmail}</p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Link href="/" onClick={() => setIsOpen(false)}>
              На сайт
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Мобильная кнопка меню */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-[#0a0a0a] text-white hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Мобильный overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Сайдбар для мобильных */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-[#0a0a0a] text-white flex flex-col transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Сайдбар для десктопа */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0a0a0a] text-white hidden md:flex md:flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
