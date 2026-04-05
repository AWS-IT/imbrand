'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, Upload, X, GripVertical } from 'lucide-react'
import { generateSlug } from '@/lib/utils'

// Схема валидации
const productSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  slug: z.string().min(1, 'Введите URL'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Цена должна быть положительной'),
  oldPrice: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1, 'Выберите размер'),
    color: z.string().min(1, 'Введите цвет'),
    colorHex: z.string().optional(),
    stock: z.coerce.number().min(0),
    sku: z.string().optional(),
  })),
})

type ProductFormData = z.infer<typeof productSchema>

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id: string
  url: string
  position: number
}

interface ProductFormProps {
  product?: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    oldPrice: number | null
    categoryId: string | null
    isActive: boolean
    isFeatured: boolean
    images: ProductImage[]
    variants: {
      id: string
      size: string
      color: string
      colorHex: string | null
      stock: number
      sku: string | null
    }[]
  }
  categories: Category[]
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE SIZE']

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<(ProductImage | { url: string; file: File })[]>(
    product?.images || []
  )
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      price: product?.price || 0,
      oldPrice: product?.oldPrice || undefined,
      categoryId: product?.categoryId || '',
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
      variants: product?.variants?.map(v => ({
        ...v,
        colorHex: v.colorHex || undefined,
        sku: v.sku || undefined,
      })) || [
        { size: 'S', color: 'Черный', stock: 0 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  const name = watch('name')

  // Автогенерация slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setValue('name', newName)
    if (!product) {
      setValue('slug', generateSlug(newName))
    }
  }

  // Загрузка изображений
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploadingImages(true)

    try {
      const newImages: { url: string; file: File }[] = []

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 10 * 1024 * 1024) continue // 10MB max

        const reader = new FileReader()
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            newImages.push({ url: reader.result as string, file })
            resolve()
          }
          reader.readAsDataURL(file)
        })
      }

      setImages([...images, ...newImages])
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Удаление изображения
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // Отправка формы
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setIsSubmitting(true)

    try {
      // Формируем данные с изображениями
      const formData = new FormData()
      formData.append('data', JSON.stringify(data))

      // Добавляем файлы изображений
      images.forEach((img, index) => {
        if ('file' in img) {
          formData.append(`image_${index}`, img.file)
        } else {
          formData.append(`existing_${index}`, img.id)
        }
      })

      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const response = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка сохранения')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Ошибка:', error)
      alert(error instanceof Error ? error.message : 'Ошибка сохранения товара')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  onChange={handleNameChange}
                  placeholder="Платье миди с V-образным вырезом"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL (slug)</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="plate-midi-s-v-obraznym-vyrezom"
                />
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Подробное описание товара..."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Цена *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price')}
                    placeholder="5990"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oldPrice">Старая цена</Label>
                  <Input
                    id="oldPrice"
                    type="number"
                    {...register('oldPrice')}
                    placeholder="7990"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Изображения */}
          <Card>
            <CardHeader>
              <CardTitle>Изображения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.url}
                      alt={`Фото ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}

                {/* Кнопка добавления */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Добавить</span>
                    </>
                  )}
                </button>
              </div>

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <p className="text-xs text-gray-500">
                Перетащите фото или нажмите для загрузки. Макс. 10MB на файл.
              </p>
            </CardContent>
          </Card>

          {/* Варианты */}
          <Card>
            <CardHeader>
              <CardTitle>Варианты (размеры и цвета)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Размер</Label>
                      <Select
                        defaultValue={field.size}
                        onValueChange={(value) => setValue(`variants.${index}.size`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Цвет</Label>
                      <Input
                        {...register(`variants.${index}.color`)}
                        placeholder="Черный"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Остаток</Label>
                      <Input
                        type="number"
                        {...register(`variants.${index}.stock`)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Артикул</Label>
                      <Input
                        {...register(`variants.${index}.sku`)}
                        placeholder="SKU-001"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ size: 'M', color: '', stock: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить вариант
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Публикация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Активен</Label>
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Избранное</Label>
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register('isFeatured')}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Категория</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                defaultValue={product?.categoryId || ''}
                onValueChange={(value) => setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
