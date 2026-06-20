'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, X } from 'lucide-react'
import { createCategory, updateCategory } from '@/actions/category'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
}

interface CategoryFormProps {
  category?: Category
  allCategories: { id: string; name: string }[]
}

export function CategoryForm({ category, allCategories }: CategoryFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(category?.name || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')
  const [parentId, setParentId] = useState(category?.parentId || '')
  const [imagePreview, setImagePreview] = useState(category?.image || '')
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  // Автогенерация slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        }
        return map[char] || char
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!category) {
      setSlug(generateSlug(value))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Разрешены только JPG, PNG и WebP')
      return
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Максимальный размер файла: 5 MB')
      return
    }

    // Создаем preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setImageBase64(base64)
      setImagePreview(base64)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImagePreview('')
    setImageBase64(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !slug.trim()) {
      setError('Заполните название и slug')
      return
    }

    startTransition(async () => {
      const data = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
        imageBase64: imageBase64 || undefined,
        image: imageBase64 ? undefined : (imagePreview || undefined),
      }

      const result = category
        ? await updateCategory(category.id, data)
        : await createCategory(data)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/admin/categories')
        router.refresh()
      }
    })
  }

  // Фильтруем текущую категорию из списка родителей
  const availableParents = allCategories.filter(c => c.id !== category?.id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Название *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Например: Платья"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="platya"
        />
        <p className="text-xs text-gray-500">
          URL категории: /catalog/{slug || 'slug'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание категории..."
          rows={3}
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Изображение фона</Label>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Загрузить изображение
            </Button>
          </div>

          {imagePreview && (
            <div className="relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imagePreview}
                alt="Превью"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Рекомендуемый размер: 600x800 px. Форматы: JPG, PNG, WebP. Макс. размер: 5 MB.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent">Родительская категория</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите родителя (необязательно)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Без родителя</SelectItem>
            {availableParents.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {category ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  )
}
