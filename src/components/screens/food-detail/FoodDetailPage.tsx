import { useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { DetailTopNav } from '../../layout/DetailTopNav'
import { ServingInput } from './ServingInput'
import { NutritionDashboard } from './NutritionDashboard'
import { AdditionalInfo } from './AdditionalInfo'
import { sampleFoods } from '../../../data/sampleFoods'
import { useFoodLogStore } from '../../../stores/useFoodLogStore'
import { useUserStore } from '../../../stores/useUserStore'
import type { ServingUnit, MealType, FoodProduct } from '../../../types'

export function FoodDetailPage() {
  const { foodId } = useParams<{ foodId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const addEntry = useFoodLogStore((s) => s.addEntry)
  const goals = useUserStore((s) => s.goals)
  const updateSettings = useUserStore((s) => s.updateSettings)
  const favorites = useUserStore((s) => s.settings.favoriteProducts)

  const routeState = location.state as { product?: FoodProduct; source?: string } | null
  const scannedProduct = routeState?.product
  const entrySource = routeState?.source
  const food = scannedProduct ?? sampleFoods.find((f) => f.id === foodId) ?? sampleFoods[0]

  const [amount, setAmount] = useState(food.servingSize)
  const [unit, setUnit] = useState<ServingUnit>(food.servingUnit)
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast')
  const [isFavorite, setIsFavorite] = useState(food.isFavorite)

  const scaleFactor = amount / food.servingSize
  const scaled = {
    calories: Math.round(food.calories * scaleFactor),
    protein: +(food.protein * scaleFactor).toFixed(1),
    carbs: +(food.carbs * scaleFactor).toFixed(1),
    fat: +(food.fat * scaleFactor).toFixed(1),
    fiber: +(food.fiber * scaleFactor).toFixed(1),
  }

  const handleAddToLog = useCallback(() => {
    const entry = {
      id: crypto.randomUUID(),
      foodId: food.id,
      name: food.name,
      description: `${amount} ${unit}`,
      icon: 'restaurant',
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fat: scaled.fat,
      fiber: scaled.fiber,
      servingAmount: amount,
      servingUnit: unit,
      mealType: selectedMeal,
      loggedAt: new Date().toISOString(),
      source: entrySource,
    }
    addEntry(entry)
    navigate('/', { replace: true })
  }, [food, amount, unit, scaled, selectedMeal, addEntry, navigate, entrySource])

  const handleToggleFavorite = useCallback(() => {
    const newFavs = favorites.includes(food.id)
      ? favorites.filter((f) => f !== food.id)
      : [...favorites, food.id]
    updateSettings({ favoriteProducts: newFavs })
    setIsFavorite(!isFavorite)
  }, [food.id, favorites, isFavorite, updateSettings])

  const additionalItems = [
    { label: 'Sodium', value: `${food.sodium}mg` },
    { label: 'Sugars', value: `${food.sugars}g` },
    { label: 'Calcium', value: food.calcium },
  ]

  return (
    <div className="min-h-dvh bg-background text-on-background flex flex-col">
      <DetailTopNav
        title="Product Details"
        actions={[
          { icon: 'favorite', label: 'Favorite', onClick: handleToggleFavorite },
          { icon: 'share', label: 'Share', onClick: () => {} },
        ]}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-margin-mobile py-6">
        {/* Hero Branding Section */}
        <section className="mb-8 flex items-start gap-4">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden shrink-0 bg-surface-container-low shadow-sm">
            <img alt={food.name} className="h-full w-full object-cover" src={food.imageUrl} onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-food.png' }} />
          </div>
          <div className="flex flex-col justify-center h-24">
            <p className="text-label-lg text-primary uppercase tracking-wider mb-1">{food.brand}</p>
            <h1 className="text-headline-md">{food.name}</h1>
            <p className="text-body-md text-outline">{food.tagline}</p>
          </div>
        </section>

        {/* AI estimate disclaimer */}
        {entrySource === 'ai_estimate' && (
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 text-xl shrink-0 mt-0.5">warning</span>
            <p className="text-body-sm text-amber-800">
              Nutritional values are AI-estimated approximations, not verified lab data. Use as a rough guide only.
            </p>
          </div>
        )}

        {/* Serving & Meal */}
        <section className="mb-8">
          <ServingInput
            amount={amount}
            unit={unit}
            onAmountChange={setAmount}
            onUnitChange={setUnit}
            selectedMeal={selectedMeal}
            onMealChange={setSelectedMeal}
          />
        </section>

        {/* Nutrition Dashboard */}
        <section className="mb-8">
          <NutritionDashboard
            energy={scaled.calories}
            protein={scaled.protein}
            carbs={scaled.carbs}
            fat={scaled.fat}
            fiber={scaled.fiber}
            macroGoals={{
              protein: goals.protein,
              carbs: goals.carbs,
              fat: goals.fat,
              fiber: goals.fiber,
            }}
          />
        </section>

        {/* Additional Info */}
        <AdditionalInfo items={additionalItems} />

        <div className="h-24" />
      </main>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-outline-variant/20 z-50">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={handleAddToLog}
            className="w-full bg-primary-container text-white font-semibold h-14 rounded-full
              flex items-center justify-center gap-2 shadow-lg active:scale-95 duration-200 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add to Log
          </button>
        </div>
      </div>
    </div>
  )
}
