import Link from 'next/link'
import { Instagram, Send, Phone, Mail, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface FooterProps {
  siteName?: string
  contactEmail?: string | null
  contactPhone?: string | null
  contactAddress?: string | null
  instagramUrl?: string | null
  telegramUrl?: string | null
}

export function Footer({
  siteName = 'Imbrand',
  contactEmail,
  contactPhone,
  contactAddress,
  instagramUrl,
  telegramUrl,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Логотип и описание */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-semibold tracking-tight">
                {siteName}
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Премиальная женская одежда для тех, кто ценит стиль и качество.
            </p>
            <div className="flex space-x-4 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Каталог */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Каталог
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/catalog"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Все товары
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog/new"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Новинки
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog/sale"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Скидки
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Информация
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/delivery"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Возврат товара
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Размерная сетка
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Контакты
            </h3>
            <ul className="space-y-3">
              {contactPhone && (
                <li className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <a
                    href={`tel:${contactPhone.replace(/\D/g, '')}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {contactPhone}
                  </a>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactAddress && (
                <li className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">{contactAddress}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Копирайт */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm">
            © {currentYear} {siteName}. Все права защищены.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-xs">Visa</span>
            <span className="text-gray-500 text-xs">Mastercard</span>
            <span className="text-gray-500 text-xs">МИР</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
