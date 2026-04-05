import { prisma } from '@/lib/prisma'
import { SettingsForm } from './SettingsForm'

async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'main' },
  })
  return settings
}

export const metadata = {
  title: 'Настройки сайта — Админ Imbrand',
}

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold">Настройки сайта</h1>
        <p className="text-gray-500 mt-1">
          Управление основными настройками вашего магазина
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
