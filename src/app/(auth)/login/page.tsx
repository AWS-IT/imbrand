import Link from 'next/link'
import { LoginForm } from './LoginForm'

export const metadata = {
  title: 'Вход — Imbrand',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Логотип */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-semibold text-[#0a0a0a]">
              Imbrand
            </span>
          </Link>
        </div>

        {/* Форма */}
        <div className="bg-white p-8 rounded-lg border shadow-sm">
          <h1 className="text-2xl font-semibold text-center mb-6">
            Вход в аккаунт
          </h1>
          <LoginForm />
        </div>

        {/* Ссылка на главную */}
        <p className="text-center text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            ← Вернуться на главную
          </Link>
        </p>
      </div>
    </div>
  )
}
