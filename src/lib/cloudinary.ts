import { v2 as cloudinary } from 'cloudinary'

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Загрузка изображения в Cloudinary
export async function uploadImage(
  file: string, // base64 или URL
  options?: {
    folder?: string
    publicId?: string
    transformation?: object[]
  }
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder: options?.folder || 'imbrand',
    public_id: options?.publicId,
    transformation: options?.transformation || [
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

// Загрузка логотипа
export async function uploadLogo(file: string): Promise<{ url: string; publicId: string }> {
  return uploadImage(file, {
    folder: 'imbrand/logo',
    transformation: [
      { width: 400, height: 120, crop: 'fit' },
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
  })
}

// Загрузка изображения товара
export async function uploadProductImage(file: string): Promise<{ url: string; publicId: string }> {
  return uploadImage(file, {
    folder: 'imbrand/products',
    transformation: [
      { width: 1200, height: 1600, crop: 'limit' },
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
  })
}

// Загрузка изображения категории
export async function uploadCategoryImage(file: string): Promise<{ url: string; publicId: string }> {
  return uploadImage(file, {
    folder: 'imbrand/categories',
    transformation: [
      { width: 800, height: 800, crop: 'fill' },
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
  })
}

// Удаление изображения из Cloudinary
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Ошибка удаления изображения:', error)
    return false
  }
}

// Получение оптимизированного URL изображения
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number
    height?: number
    quality?: string
  }
): string {
  if (!url.includes('cloudinary.com')) return url

  const { width, height, quality = 'auto:best' } = options || {}

  // Вставляем трансформации в URL
  const transformations = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push(`q_${quality}`, 'f_auto')

  const transformString = transformations.join(',')

  // Находим позицию /upload/ и вставляем трансформации после неё
  return url.replace('/upload/', `/upload/${transformString}/`)
}
