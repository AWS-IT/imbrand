# Инструкция по настройке и запуску Imbrand

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните все значения:

```bash
cp .env.example .env
```

### 3. Настройка базы данных MySQL

```bash
# Генерация Prisma Client
npm run db:generate

# Применение миграций
npm run db:push

# Заполнение тестовыми данными
npm run db:seed
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Сайт будет доступен по адресу: http://localhost:3000
Админ-панель: http://localhost:3000/admin

**Данные для входа:**
- Email: admin@imbrand.ru
- Пароль: admin123

---

## Настройка сервисов

### MySQL

Установите MySQL и создайте базу данных:

```sql
CREATE DATABASE imbrand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'imbrand'@'localhost' IDENTIFIED BY 'ваш_пароль';
GRANT ALL PRIVILEGES ON imbrand.* TO 'imbrand'@'localhost';
FLUSH PRIVILEGES;
```

В `.env` укажите:
```
DATABASE_URL="mysql://imbrand:ваш_пароль@localhost:3306/imbrand"
```

### Cloudinary (хранение изображений)

1. Зарегистрируйтесь на https://cloudinary.com
2. В Dashboard скопируйте:
   - Cloud Name
   - API Key
   - API Secret
3. Добавьте в `.env`:
```
CLOUDINARY_CLOUD_NAME="ваш-cloud-name"
CLOUDINARY_API_KEY="ваш-api-key"
CLOUDINARY_API_SECRET="ваш-api-secret"
```

### Тинькофф Касса (платежи)

1. Зарегистрируйтесь как ИП/ООО на https://business.tinkoff.ru
2. Подключите интернет-эквайринг
3. В личном кабинете получите:
   - Terminal Key
   - Secret Key
4. Настройте Notification URL для вебхуков
5. Добавьте в `.env`:
```
TINKOFF_TERMINAL_KEY="ваш-terminal-key"
TINKOFF_SECRET_KEY="ваш-secret-key"
TINKOFF_NOTIFICATION_URL="https://ваш-домен.ru/api/webhook/tinkoff"
TINKOFF_SUCCESS_URL="https://ваш-домен.ru/checkout/success"
TINKOFF_FAIL_URL="https://ваш-домен.ru/checkout/fail"
```

### Telegram Bot (уведомления)

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Добавьте бота в чат/группу для получения уведомлений
4. Узнайте Chat ID (можно через @userinfobot или API)
5. Добавьте в `.env`:
```
TELEGRAM_BOT_TOKEN="ваш-bot-token"
TELEGRAM_CHAT_ID="ваш-chat-id"
NOTIFICATION_TELEGRAM_ENABLED="true"
```

### Green-API (WhatsApp уведомления)

1. Зарегистрируйтесь на https://green-api.com
2. Создайте инстанс и авторизуйте WhatsApp
3. Получите Instance ID и API Token
4. Добавьте в `.env`:
```
GREEN_API_INSTANCE_ID="ваш-instance-id"
GREEN_API_TOKEN="ваш-api-token"
GREEN_API_PHONE_NUMBER="79001234567"
NOTIFICATION_WHATSAPP_ENABLED="true"
```

---

## Деплой на сервер (Self-Hosted)

### Требования
- Node.js 18+
- MySQL 8+
- Nginx (опционально, как reverse proxy)
- PM2 (для управления процессами)

### Шаги деплоя

1. **Клонирование и настройка:**
```bash
git clone <репозиторий>
cd imbrand
npm install
cp .env.example .env
# Отредактируйте .env
```

2. **Сборка проекта:**
```bash
npm run db:generate
npm run db:push
npm run build
```

3. **Запуск через PM2:**
```bash
npm install -g pm2
pm2 start npm --name "imbrand" -- start
pm2 save
pm2 startup
```

4. **Настройка Nginx:**
```nginx
server {
    listen 80;
    server_name ваш-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **SSL сертификат (Let's Encrypt):**
```bash
sudo certbot --nginx -d ваш-домен.ru
```

---

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшена |
| `npm start` | Запуск собранного приложения |
| `npm run db:generate` | Генерация Prisma Client |
| `npm run db:push` | Применение схемы к БД |
| `npm run db:migrate` | Создание миграций |
| `npm run db:seed` | Заполнение тестовыми данными |
| `npm run db:studio` | Открыть Prisma Studio |
