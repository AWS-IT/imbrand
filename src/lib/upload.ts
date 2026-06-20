import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

// Базовая директория для загрузок
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'public', 'uploads')

// Разрешенные типы файлов
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Максимальный размер файла (5 MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Расширения для типов
const TYPE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

interface UploadResult {
  url: string
  path: string
  filename: string
}

interface UploadOptions {
  folder?: string
}

/**
 * Создает директорию если не существует
 */
function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Генерирует уникальное имя файла
 */
function generateFilename(mimeType: string): string {
  const timestamp = Date.now()
  const random = randomBytes(8).toString('hex')
  const ext = TYPE_EXTENSIONS[mimeType] || '.jpg'
  return `${timestamp}-${random}${ext}`
}

/**
 * Загружает изображение из base64 строки
 */
export async function uploadImage(
  base64Data: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder || 'images'
  const uploadDir = path.join(UPLOAD_BASE_DIR, folder)

  // Создаем директорию
  ensureDirectoryExists(uploadDir)

  // Парсим base64
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Некорректный формат base64')
  }

  const mimeType = matches[1]
  const base64Content = matches[2]

  // Проверяем тип файла
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Недопустимый тип файла: ${mimeType}. Разрешены: ${ALLOWED_TYPES.join(', ')}`)
  }

  // Декодируем base64
  const buffer = Buffer.from(base64Content, 'base64')

  // Проверяем размер
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024} MB`)
  }

  // Генерируем имя файла и сохраняем
  const filename = generateFilename(mimeType)
  const filePath = path.join(uploadDir, filename)

  fs.writeFileSync(filePath, buffer)

  // Возвращаем URL относительно public
  const url = `/uploads/${folder}/${filename}`

  return {
    url,
    path: filePath,
    filename,
  }
}

/**
 * Загружает изображение товара
 */
export async function uploadProductImage(base64Data: string): Promise<{ url: string; publicId: string }> {
  const result = await uploadImage(base64Data, { folder: 'products' })
  return {
    url: result.url,
    publicId: result.filename, // Используем filename как publicId для совместимости
  }
}

/**
 * Загружает логотип сайта
 */
export async function uploadLogo(base64Data: string): Promise<{ url: string; publicId: string }> {
  const result = await uploadImage(base64Data, { folder: 'logo' })
  return {
    url: result.url,
    publicId: result.filename,
  }
}

/**
 * Загружает изображение категории
 */
export async function uploadCategoryImage(base64Data: string): Promise<{ url: string; publicId: string }> {
  const result = await uploadImage(base64Data, { folder: 'categories' })
  return {
    url: result.url,
    publicId: result.filename,
  }
}

/**
 * Загружает изображение баннера
 */
export async function uploadBannerImage(base64Data: string): Promise<{ url: string; publicId: string }> {
  const result = await uploadImage(base64Data, { folder: 'banners' })
  return {
    url: result.url,
    publicId: result.filename,
  }
}

/**
 * Удаляет изображение по publicId (filename)
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    // Ищем файл в различных папках
    const folders = ['products', 'logo', 'categories', 'banners', 'images']

    for (const folder of folders) {
      const filePath = path.join(UPLOAD_BASE_DIR, folder, publicId)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
    }

    // Если publicId содержит путь
    if (publicId.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), 'public', publicId)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Ошибка удаления файла:', error)
    return false
  }
}

/**
 * Проверяет, является ли URL локальным путем к файлу
 */
export function isLocalUpload(url: string): boolean {
  return url.startsWith('/uploads/')
}
