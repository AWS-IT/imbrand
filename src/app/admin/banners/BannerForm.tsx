'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Upload, X } from 'lucide-react'
import { createBanner, updateBanner } from '@/actions/banner'
import Image from 'next/image'

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  buttonText: string | null
  buttonLink: string | null
  imageUrl: string
  imagePublicId: string | null
  isActive: boolean
  position: number
}

interface BannerFormProps {
  banner?: Banner
}

export function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(banner?.title || '')
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '')
  const [buttonText, setButtonText] = useState(banner?.buttonText || '')
  const [buttonLink, setButtonLink] = useState(banner?.buttonLink || '')
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState(banner?.imageUrl || '')
  const [isActive, setIsActive] = useState(banner?.isActive ?? true)
  const [position, setPosition] = useState(banner?.position ?? 0)

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
      setImageUrl('') // Сбрасываем URL если загружаем файл
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!imageUrl.trim() && !imageBase64) {
      setError('Загрузите изображение или укажите URL')
      return
    }

    startTransition(async () => {
      const data = {
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        buttonLink: buttonLink.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageBase64: imageBase64 || undefined,
        isActive,
        position,
      }

      const result = banner
        ? await updateBanner(banner.id, data)
        : await createBanner(data)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/admin/banners')
        router.refresh()
      }
    })
  }

  const clearImage = () => {
    setImageUrl('')
    setImageBase64(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Изображение */}
      <div className="space-y-2">
        <Label>Изображение *</Label>
        <div className="space-y-3">
          {/* Загрузка файла */}
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
              Загрузить файл
            </Button>
          </div>

          {/* Или URL */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">или</span>
            <Input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setImageBase64(null)
                setImagePreview(e.target.value)
              }}
              placeholder="URL изображения"
              className="flex-1"
            />
          </div>

          {/* Превью */}
          {imagePreview && (
            <div className="relative aspect-[16/9] max-w-md rounded-lg overflow-hidden bg-gray-100">
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
            Рекомендуемый размер: 1920x800 px. Форматы: JPG, PNG, WebP. Макс. размер: 5 MB.
          </p>
        </div>
      </div>

      {/* Заголовок */}
      <div className="space-y-2">
        <Label htmlFor="title">Заголовок</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая коллекция"
        />
      </div>

      {/* Подзаголовок */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Подзаголовок</Label>
        <Textarea
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Описание акции или коллекции..."
          rows={2}
        />
      </div>

      {/* Кнопка */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buttonText">Текст кнопки</Label>
          <Input
            id="buttonText"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="Смотреть"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="buttonLink">Ссылка кнопки</Label>
          <Input
            id="buttonLink"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="/catalog"
          />
        </div>
      </div>

      {/* Позиция */}
      <div className="space-y-2">
        <Label htmlFor="position">Позиция (порядок)</Label>
        <Input
          id="position"
          type="number"
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
          min={0}
          className="w-24"
        />
        <p className="text-xs text-gray-500">
          Меньшее число = выше в списке
        </p>
      </div>

      {/* Активность */}
      <div className="flex items-center gap-3">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">Показывать на сайте</Label>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {banner ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  )
}
