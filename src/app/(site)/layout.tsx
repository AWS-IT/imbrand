import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'main' },
  })
  return settings
}

async function getCartCount(userId: string | undefined) {
  if (!userId) return 0
  const count = await prisma.cartItem.count({
    where: { userId },
  })
  return count
}

async function getWishlistCount(userId: string | undefined) {
  if (!userId) return 0
  const count = await prisma.wishlistItem.count({
    where: { userId },
  })
  return count
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const settings = await getSiteSettings()

  const [cartCount, wishlistCount] = await Promise.all([
    getCartCount(session?.user?.id),
    getWishlistCount(session?.user?.id),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        logoUrl={settings?.logoUrl}
        cartItemsCount={cartCount}
        wishlistCount={wishlistCount}
        isLoggedIn={!!session?.user}
        isAdmin={session?.user?.role === 'ADMIN'}
      />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      <Footer
        siteName={settings?.siteName || 'Imbrand'}
        contactEmail={settings?.contactEmail}
        contactPhone={settings?.contactPhone}
        contactAddress={settings?.contactAddress}
        instagramUrl={settings?.instagramUrl}
        telegramUrl={settings?.telegramUrl}
      />
    </div>
  )
}
