'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchProducts } from '@/actions/product'
import { formatPrice } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  oldPrice: number | null
  image: string | null
  category: string | null
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const { products } = await searchProducts(query)
        setResults(products)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  const handleResultClick = useCallback((slug: string) => {
    onOpenChange(false)
    router.push(`/product/${slug}`)
  }, [onOpenChange, router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <DialogTitle className="sr-only">Поиск товаров</DialogTitle>

        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Поиск товаров..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 text-base"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleResultClick(product.slug)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                          Нет фото
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {product.category && (
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          {product.category}
                        </p>
                      )}
                      <p className="font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="py-8 text-center text-gray-500">
              <p>Ничего не найдено</p>
              <p className="text-sm mt-1">Попробуйте изменить запрос</p>
            </div>
          ) : query.length > 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">Введите минимум 2 символа</p>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">Начните вводить название товара</p>
            </div>
          )}
        </div>

        {/* View all results link */}
        {results.length > 0 && (
          <div className="border-t p-3">
            <Link
              href={`/catalog?search=${encodeURIComponent(query)}`}
              onClick={() => onOpenChange(false)}
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Показать все результаты
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
