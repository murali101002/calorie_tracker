import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DetailTopNav } from '../../layout/DetailTopNav'
import { ManualEntrySheet } from '../daily-log/ManualEntrySheet'
import { mapUSDAFood } from '../../../utils/mapUSDA'
import { getAiNutritionEstimate, aiEstimateToFoodProduct } from '../../../utils/aiNutrition'
import type { FoodProduct } from '../../../types'

interface SearchResult {
  product: FoodProduct
  hasNutrition: boolean
}

export function SearchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)

  // AI estimate state
  const [aiLoading, setAiLoading] = useState(false)
  const [aiProduct, setAiProduct] = useState<FoodProduct | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSourceNote, setAiSourceNote] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const doSearch = useCallback(async (term: string) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (!term.trim()) {
      setResults([])
      setHasSearched(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setHasSearched(true)
    setAiProduct(null)
    setAiError(null)

    const apiKey = import.meta.env.VITE_USDA_API_KEY as string

    if (!apiKey) {
      setError('USDA API key not configured. Add VITE_USDA_API_KEY to your .env file.')
      setResults([])
      setLoading(false)
      return
    }

    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: term,
            dataType: ['Foundation', 'SR Legacy', 'Branded'],
            pageSize: 20,
          }),
          signal: controller.signal,
        },
      )
      if (!res.ok) throw new Error('Network error')
      const json = await res.json()

      const foods = (json.foods ?? []) as Record<string, unknown>[]

      const results: SearchResult[] = foods.map((raw) => {
        const product = mapUSDAFood(raw as any)
        return { product, hasNutrition: product.calories > 0 }
      })

      setResults(results)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('Search unavailable. Add manually instead.')
      setResults([])
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(query)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  function handleSelect(product: FoodProduct) {
    navigate('/food-detail', { state: { product, returnTo } })
  }

  const handleAiEstimate = useCallback(async () => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      setAiError('AI estimate not configured. Add manually instead.')
      return
    }

    setAiLoading(true)
    setAiError(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      const estimate = await getAiNutritionEstimate(query.trim(), apiKey, controller.signal)
      const product = aiEstimateToFoodProduct(estimate)
      setAiProduct(product)
      setAiSourceNote(estimate.source_note)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setAiError("Couldn't get an estimate. Add manually instead.")
      } else {
        setAiError("Couldn't get an estimate. Add manually instead.")
      }
    } finally {
      clearTimeout(timeout)
      setAiLoading(false)
    }
  }, [query])

  const showEmpty = hasSearched && !loading && !error && results.length === 0
  const showResults = hasSearched && !loading && !error && results.length > 0
  const allNoNutrition = showResults && results.every((r) => !r.hasNutrition)
  const showAiPrompt = (showEmpty || allNoNutrition) && !aiProduct && !aiLoading

  return (
    <div className="min-h-dvh bg-background text-on-background flex flex-col">
      <DetailTopNav title="Search" actions={[]} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-margin-mobile py-4">
        {/* Search bar */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-12 pr-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
          />
          {(loading || aiLoading) && (
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xl animate-spin">
              progress_activity
            </span>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 animate-pulse">
                <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-1/3 bg-gray-100 rounded mb-2" />
                <div className="h-4 w-1/4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center space-y-4 py-12">
            <span className="material-symbols-outlined text-5xl text-outline">cloud_off</span>
            <p className="text-body-lg text-on-background">{error}</p>
            <button
              type="button"
              onClick={() => setShowManualEntry(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-full font-semibold active:scale-95 transition-all"
            >
              Add Manually
            </button>
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="text-center space-y-4 py-12">
            <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
            <p className="text-body-lg text-on-background">No products found</p>
            <p className="text-body-md text-outline">Try adding it manually.</p>
            <button
              type="button"
              onClick={() => setShowManualEntry(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-full font-semibold active:scale-95 transition-all"
            >
              Add Manually
            </button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-3">
            {results.map((r, i) => (
              <button
                key={r.product.id || i}
                type="button"
                onClick={() => handleSelect(r.product)}
                className="w-full bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  {r.product.imageUrl ? (
                    <img
                      alt=""
                      src={r.product.imageUrl}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.style.display = 'none'
                        el.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <span className={`material-symbols-outlined text-2xl text-outline ${r.product.imageUrl ? 'hidden' : ''}`}>
                    restaurant
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-lg font-semibold truncate">{r.product.name}</p>
                  <p className="text-body-sm text-outline truncate">
                    {r.product.brand || 'Generic'}
                  </p>
                  <p className="text-label-sm text-primary mt-0.5">{r.product.calories} kcal / serving</p>
                </div>
                <span className="material-symbols-outlined text-outline text-xl">chevron_right</span>
              </button>
            ))}
          </div>
        )}

        {/* AI estimate prompt */}
        {showAiPrompt && (
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={handleAiEstimate}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-amber-500 text-2xl">auto_awesome</span>
              <div className="text-left flex-1">
                <p className="text-body-md font-semibold text-amber-800">Not finding it? Get an AI estimate</p>
                <p className="text-label-sm text-amber-600">Uses Claude to approximate nutrition data</p>
              </div>
              <span className="material-symbols-outlined text-amber-400">arrow_forward</span>
            </button>
          </div>
        )}

        {/* AI loading */}
        {aiLoading && (
          <div className="mt-4">
            <div className="bg-surface-container-lowest rounded-2xl p-6 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-500 text-2xl">auto_awesome</span>
              </div>
              <div>
                <p className="text-body-md font-semibold text-amber-700">Getting AI estimate...</p>
                <p className="text-label-sm text-outline">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        {/* AI error */}
        {aiError && (
          <div className="mt-4 text-center space-y-3 py-6">
            <span className="material-symbols-outlined text-3xl text-outline">error_outline</span>
            <p className="text-body-md text-outline">{aiError}</p>
            <button
              type="button"
              onClick={() => setShowManualEntry(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-full font-semibold active:scale-95 transition-all"
            >
              Add Manually
            </button>
          </div>
        )}

        {/* AI result card */}
        {aiProduct && (
          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
              <span className="text-label-sm text-amber-600">AI estimate — values are approximate</span>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate('/food-detail', {
                  state: { product: aiProduct, source: 'ai_estimate', returnTo },
                })
              }
              className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-500 text-2xl">auto_awesome</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-lg font-semibold truncate">{aiProduct.name}</p>
                <p className="text-body-sm text-outline truncate">{aiSourceNote}</p>
                <p className="text-label-sm text-primary mt-0.5">{aiProduct.calories} kcal / 100g</p>
              </div>
              <span className="material-symbols-outlined text-outline text-xl">chevron_right</span>
            </button>
          </div>
        )}
      </main>

      <ManualEntrySheet
        open={showManualEntry}
        mealType="snack"
        onClose={() => setShowManualEntry(false)}
      />
    </div>
  )
}
