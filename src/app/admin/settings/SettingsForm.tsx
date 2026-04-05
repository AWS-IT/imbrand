'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLogoUpload } from '@/components/admin/AdminLogoUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

interface SiteSettings {
  id: string
  siteName: string
  logoUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
  instagramUrl: string | null
  telegramUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  deliveryInfo: string | null
}

interface SettingsFormProps {
  settings: SiteSettings | null
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    siteName: settings?.siteName || 'Imbrand',
    contactEmail: settings?.contactEmail || '',
    contactPhone: settings?.contactPhone || '',
    contactAddress: settings?.contactAddress || '',
    instagramUrl: settings?.instagramUrl || '',
    telegramUrl: settings?.telegramUrl || '',
    metaTitle: settings?.metaTitle || '',
    metaDescription: settings?.metaDescription || '',
    deliveryInfo: settings?.deliveryInfo || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Ошибка сохранения')
      }

      router.refresh()
      alert('Настройки сохранены!')
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка сохранения настроек')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoUpload = async (base64: string) => {
    try {
      const response = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки')
      }

      router.refresh()
    } catch (error) {
      console.error('Ошибка:', error)
      throw error
    }
  }

  const handleLogoRemove = async () => {
    try {
      const response = await fetch('/api/admin/settings/logo', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка удаления')
      }

      router.refresh()
    } catch (error) {
      console.error('Ошибка:', error)
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Логотип */}
      <Card>
        <CardHeader>
          <CardTitle>Логотип</CardTitle>
          <CardDescription>
            Загрузите логотип вашего магазина. Он будет отображаться в шапке сайта.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLogoUpload
            currentLogoUrl={settings?.logoUrl}
            onUpload={handleLogoUpload}
            onRemove={handleLogoRemove}
          />
        </CardContent>
      </Card>

      {/* Основные настройки */}
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Название сайта</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              placeholder="Imbrand"
            />
          </div>
        </CardContent>
      </Card>

      {/* Контактная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
          <CardDescription>
            Эти данные будут отображаться в подвале сайта.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Телефон</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="info@imbrand.ru"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactAddress">Адрес</Label>
            <Textarea
              id="contactAddress"
              value={formData.contactAddress}
              onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
              placeholder="г. Москва, ул. Примерная, д. 1"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Социальные сети */}
      <Card>
        <CardHeader>
          <CardTitle>Социальные сети</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/imbrand"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegramUrl">Telegram</Label>
              <Input
                id="telegramUrl"
                value={formData.telegramUrl}
                onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                placeholder="https://t.me/imbrand"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO настройки</CardTitle>
          <CardDescription>
            Настройки для поисковой оптимизации.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="Imbrand — Премиальная женская одежда"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="Интернет-магазин премиальной женской одежды..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Информация о доставке */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о доставке</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="deliveryInfo">Условия доставки</Label>
            <Textarea
              id="deliveryInfo"
              value={formData.deliveryInfo}
              onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
              placeholder="Бесплатная доставка при заказе от 10 000 ₽..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Кнопка сохранения */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            'Сохранить настройки'
          )}
        </Button>
      </div>
    </form>
  )
}
