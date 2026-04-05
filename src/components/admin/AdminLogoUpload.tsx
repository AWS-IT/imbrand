'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2 } from 'lucide-react'

interface AdminLogoUploadProps {
  currentLogoUrl?: string | null
  onUpload: (base64: string) => Promise<void>
  onRemove: () => Promise<void>
}

export function AdminLogoUpload({
  currentLogoUrl,
  onUpload,
  onRemove,
}: AdminLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверяем размер (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Конвертируем в base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        setPreview(base64)

        await onUpload(base64)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка загрузки логотипа')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Удалить логотип?')) return

    setIsRemoving(true)
    try {
      await onRemove()
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
      alert('Ошибка удаления логотипа')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Логотип сайта</Label>

      {preview ? (
        <div className="relative inline-block">
          <div className="relative w-48 h-16 bg-gray-100 rounded-lg overflow-hidden border">
            <Image
              src={preview}
              alt="Логотип"
              fill
              className="object-contain p-2"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-48 h-16 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          ) : (
            <div className="text-center">
              <Upload className="h-6 w-6 mx-auto text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Загрузить</span>
            </div>
          )}
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        Рекомендуемый размер: 400×120 px. Форматы: PNG, JPG, SVG. Макс. 5MB.
      </p>
    </div>
  )
}
