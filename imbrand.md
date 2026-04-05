Ты — senior full-stack разработчик с более чем 10-летним опытом, специалист по созданию премиальных продающих онлайн-магазинов на Next.js.
Создай полноценный production-ready онлайн-магазин женской одежды под названием Imbrand.
Весь интерфейс сайта, админ-панель, уведомления, сообщения и инструкция для владельца — только на русском языке.
Технический стек (строго обязательно):

Next.js 16.2 или самая новая версия (минимум 16.0). Только App Router.
TypeScript в строгом режиме (strict: true).
Tailwind CSS + shadcn/ui + Radix UI.
Prisma ORM + MySQL.
Framer Motion для плавных анимаций.
Auth.js (NextAuth v5) для авторизации.
Загрузка изображений: Cloudinary.
Платежи: Тинькофф Касса (карты + СБП).
Уведомления: Telegram Bot API + Green-API (для WhatsApp).

Установка зависимостей
В самом начале ответа выведи полные команды для создания проекта и установки всех необходимых пакетов:
Bashnpx create-next-app@latest imbrand --typescript --tailwind --eslint --app --yes
cd imbrand
npm install prisma @prisma/client framer-motion lucide-react zod @hookform/resolvers @tanstack/react-table
npm install @auth/prisma-adapter @auth/core
npm install @sfomin/tinkoff-payment-sdk
npm install cloudinary
npm install @green-api/whatsapp-api-client
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog table form input label select textarea avatar badge skeleton toast dropdown-menu separator scroll-area
Точная структура проекта (обязательно соблюдать)
textsrc/
├── app/
│   ├── (site)/                          # Все публичные страницы магазина
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Главная страница
│   │   ├── catalog/
│   │   │   ├── page.tsx
│   │   │   └── [category]/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── account/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── admin/                           # Админ-панель
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Дашборд
│   │   ├── settings/page.tsx            # Настройки сайта (логотип и т.д.)
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── orders/page.tsx
│   └── api/
│       └── webhook/
│           └── tinkoff/route.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx                   # Логотип + навигация
│   │   └── Footer.tsx
│   ├── ui/                              # shadcn компоненты
│   ├── product/
│   ├── cart/
│   ├── wishlist/
│   ├── admin/
│   │   └── AdminLogoUpload.tsx
│   └── common/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── tinkoff.ts
│   ├── cloudinary.ts
│   ├── notifications.ts                 # Отправка в Telegram и WhatsApp
│   └── utils.ts
├── actions/                             # Server Actions
│   ├── cart.ts
│   ├── order.ts
│   ├── wishlist.ts
│   ├── review.ts
│   └── settings.ts
├── types/
├── hooks/
└── data/                                # seed с примерами женской одежды
Ключевые функциональные требования
1. Логотип в шапке

В админ-панели есть раздел «Настройки сайта» (/admin/settings).
Там можно загрузить одно изображение логотипа через Cloudinary.
Логотип сохраняется в модели SiteSettings.
В компоненте Header.tsx (слева сверху):
Если логотип загружен — показывать его через next/image (размер примерно 160×50 px).
Если логотипа нет — показывать текстовое название Imbrand красивым шрифтом.

Логотип должен быть кликабельным и вести на главную страницу.

2. Система товаров

Каждый товар может иметь несколько изображений (много фото).
Каждый товар имеет варианты (ProductVariant): размер (S, M, L, XL и др.), цвет, stock (отдельное количество для каждого размера и цвета).
В админ-панели при создании/редактировании товара можно:
Загружать несколько фото.
Добавлять любое количество вариантов с указанием размера, цвета и остатка.

Когда stock варианта = 0 — этот вариант автоматически скрывается из каталога и страницы товара.

3. Оформление заказа

Обязательное поле — номер телефона (валидация российского формата).
Адрес доставки — опционально.
Заказ создаётся со статусом PENDING_PAYMENT.
Списание остатков и отправка уведомлений происходят только после успешной оплаты (Prisma.$transaction + webhook Тинькофф).

4. Уведомления владельцу

После успешной оплаты мгновенно отправляется сообщение:
В Telegram (в указанный чат).
И/или в WhatsApp (через Green-API).

В сообщении должно быть: номер заказа, ФИО, телефон покупателя, адрес (если указан), список товаров с размерами и количеством, общая сумма.

5. Дополнительные функции

Wishlist (список желаний) — добавление/удаление товаров, отдельная страница.
Отзывы к товарам — пользователи могут оставлять текст + рейтинг 1–5. Отзывы отображаются на странице товара.

6. Дизайн и UX

Премиальный, мягкий, женственный luxury-минимализм.
Основной цвет — глубокий чёрный (#0a0a0a).
Мягкие серые тона, много воздуха, тонкие линии, плавные анимации Framer Motion.
Полностью адаптивный дизайн (mobile-first).
Всё на русском языке.

Что должен содержать твой ответ (выдавай по порядку):

Полные команды установки зависимостей.
Полный файл prisma/schema.prisma (включая модели: User, Product, ProductVariant, Category, Order, OrderItem, Payment, Review, WishlistItem, SiteSettings).
Файл .env.example со всеми необходимыми переменными (DATABASE_URL, TINKOFF_, CLOUDINARY_, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, GREEN_API_, NOTIFICATION_ и т.д.).
Код компонента Header.tsx с поддержкой логотипа.
Код страницы /admin/settings и компонента загрузки логотипа.
Код ключевых страниц и действий (оформление заказа, webhook, отправка уведомлений, админка товаров).
Инструкцию по настройке MySQL, Cloudinary, Тинькофф Касса, Telegram-бота и Green-API.
Инструкцию по self-hosted деплою.
Простую понятную инструкцию для клиентки на русском языке (как загружать логотип, добавлять товары с фото и вариантами размеров, что она будет получать в уведомлениях).

Начинай генерацию с архитектуры проекта, списка зависимостей и файла prisma/schema.prisma.
Код должен быть чистым, хорошо прокомментированным, полностью рабочим и готовым к production. Никаких заглушек, кроме мест под реальные токены и ключи.