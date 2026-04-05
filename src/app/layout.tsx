import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Imbrand — Премиальная женская одежда',
  description: 'Интернет-магазин премиальной женской одежды. Стиль, качество, элегантность.',
  keywords: 'женская одежда, платья, блузки, юбки, премиум, Imbrand',
  openGraph: {
    title: 'Imbrand — Премиальная женская одежда',
    description: 'Интернет-магазин премиальной женской одежды. Стиль, качество, элегантность.',
    type: 'website',
    locale: 'ru_RU',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
