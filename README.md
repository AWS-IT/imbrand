# Imbrand — Премиальный онлайн-магазин женской одежды

## Технологический стек

- **Next.js 15** — React фреймворк с App Router
- **TypeScript** — строгая типизация
- **Tailwind CSS + shadcn/ui + Radix UI** — стилизация и UI компоненты
- **Prisma ORM + MySQL** — работа с базой данных
- **Framer Motion** — анимации
- **Auth.js (NextAuth v5)** — аутентификация
- **Cloudinary** — хранение изображений
- **Тинькофф Касса** — приём платежей
- **Telegram Bot API + Green-API** — уведомления

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env

# Настройка базы данных
npm run db:generate
npm run db:push
npm run db:seed

# Запуск
npm run dev
```

## Структура проекта

```
src/
├── app/
│   ├── (site)/          # Публичные страницы
│   ├── (auth)/          # Авторизация
│   ├── admin/           # Админ-панель
│   └── api/             # API routes
├── components/          # React компоненты
├── lib/                 # Утилиты и конфигурация
├── actions/             # Server Actions
├── hooks/               # React hooks
└── types/               # TypeScript типы
```

## Документация

- [SETUP.md](./SETUP.md) — Инструкция по настройке
- [OWNER_GUIDE.md](./OWNER_GUIDE.md) — Инструкция для владельца магазина

## Лицензия

Private
