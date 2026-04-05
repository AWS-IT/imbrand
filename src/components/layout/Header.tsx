'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Heart, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  logoUrl?: string | null
  cartItemsCount?: number
  wishlistCount?: number
  isLoggedIn?: boolean
  isAdmin?: boolean
}

const navLinks = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/catalog/new', label: 'Новинки' },
  { href: '/catalog/sale', label: 'Скидки' },
]

export function Header({
  logoUrl,
  cartItemsCount = 0,
  wishlistCount = 0,
  isLoggedIn = false,
  isAdmin = false,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-white'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Логотип */}
          <Link href="/" className="flex-shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Imbrand"
                width={160}
                height={50}
                className="h-8 md:h-10 w-auto object-contain"
                priority
              />
            ) : (
              <span className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[#0a0a0a]">
                Imbrand
              </span>
            )}
          </Link>

          {/* Навигация (десктоп) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#0a0a0a] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0a0a0a] transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Действия */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Поиск */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              aria-label="Поиск"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Избранное */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Избранное"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-medium bg-[#0a0a0a] text-white rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Корзина */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Корзина"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-medium bg-[#0a0a0a] text-white rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Аккаунт */}
            <Link href={isLoggedIn ? '/account' : '/login'}>
              <Button
                variant="ghost"
                size="icon"
                aria-label={isLoggedIn ? 'Личный кабинет' : 'Войти'}
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Админка */}
            {isAdmin && (
              <Link href="/admin" className="hidden md:block">
                <Button variant="outline" size="sm">
                  Админ
                </Button>
              </Link>
            )}

            {/* Мобильное меню */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Меню"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-base font-medium text-gray-700 hover:text-[#0a0a0a] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="block py-2 text-base font-medium text-gray-700 hover:text-[#0a0a0a] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Админ-панель
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
