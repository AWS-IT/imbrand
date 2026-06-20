import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

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
      <AdminSidebar
        userName={session.user.name}
        userEmail={session.user.email}
      />

      {/* Основной контент */}
      <main className="md:ml-64">
        <div className="min-h-screen p-4 pt-16 md:p-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
