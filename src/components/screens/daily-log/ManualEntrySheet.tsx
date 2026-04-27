import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFoodLogStore } from '../../../stores/useFoodLogStore'
import type { MealType, ServingUnit } from '../../../types'

interface ManualEntrySheetProps {
  open: boolean
  mealType: MealType
  onClose: () => void
}

const mealOptions: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
]

type Phase = 'options' | 'form'

export function ManualEntrySheet({ open, mealType, onClose }: ManualEntrySheetProps) {
  const navigate = useNavigate()
  const addEntry = useFoodLogStore((s) => s.addEntry)

  const [phase, setPhase] = useState<Phase>('options')
  const [name, setName] = useState('')
  const [servingAmount, setServingAmount] = useState('')
  const [servingUnit, setServingUnit] = useState('g')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealType)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function reset(close: boolean) {
    setPhase('options')
    setName('')
    setServingAmount('')
    setServingUnit('g')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setSelectedMeal(mealType)
    setErrors({})
    if (close) onClose()
  }

  function handleScan() {
    reset(false)
    navigate('/scan')
  }

  function handleFormOpen() {
    setPhase('form')
  }

  function parseNumeric(value: string): number {
    const n = parseFloat(value)
    return isNaN(n) ? 0 : n
  }

  const handleSave = useCallback(() => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Food name is required'
    const calNum = parseFloat(calories)
    if (!calories || isNaN(calNum) || calNum <= 0) errs.calories = 'Calories must be greater than 0'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const now = new Date().toISOString()
    addEntry({
      id: crypto.randomUUID(),
      foodId: crypto.randomUUID(),
      name: name.trim(),
      description: `${servingAmount || '1'} ${servingUnit}`,
      icon: 'restaurant',
      calories: calNum,
      protein: parseNumeric(protein),
      carbs: parseNumeric(carbs),
      fat: parseNumeric(fat),
      fiber: 0,
      servingAmount: parseFloat(servingAmount) || 1,
      servingUnit: servingUnit as ServingUnit,
      mealType: selectedMeal,
      loggedAt: now,
      source: 'manual',
    })

    reset(true)
  }, [name, servingAmount, servingUnit, calories, protein, carbs, fat, selectedMeal, addEntry])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={() => reset(true)} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-[env(safe-area-inset-bottom,20px)] animate-slide-up max-h-[85dvh] overflow-y-auto">
        {phase === 'options' ? (
          <div className="p-6 space-y-4">
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
            <h2 className="text-headline-sm text-on-background text-center">Add to {mealOptions.find((m) => m.id === mealType)?.label}</h2>

            <button
              type="button"
              onClick={handleScan}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl text-primary">barcode_scanner</span>
              <div className="text-left">
                <p className="text-body-lg font-semibold text-on-background">Scan Barcode</p>
                <p className="text-body-sm text-outline">Scan a product barcode to auto-fill nutrition data</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleFormOpen}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl text-primary">edit_note</span>
              <div className="text-left">
                <p className="text-body-lg font-semibold text-on-background">Add Manually</p>
                <p className="text-body-sm text-outline">Enter nutrition info yourself</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setPhase('options'); setErrors({}) }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
              <h2 className="text-headline-sm text-on-background">Manual Entry</h2>
              <div className="w-8" />
            </div>

            {/* Food name */}
            <div>
              <label className="block text-label-sm text-outline mb-1">Food Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Protein Shake"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
              />
              {errors.name && <p className="text-error text-label-sm mt-1">{errors.name}</p>}
            </div>

            {/* Serving size */}
            <div>
              <label className="block text-label-sm text-outline mb-1">Serving Size</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={servingAmount}
                  onChange={(e) => setServingAmount(e.target.value)}
                  placeholder="100"
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  placeholder="g"
                  className="w-24 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Calories */}
            <div>
              <label className="block text-label-sm text-outline mb-1">Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g. 250"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
              />
              {errors.calories && <p className="text-error text-label-sm mt-1">{errors.calories}</p>}
            </div>

            {/* Macro row */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-label-sm text-outline mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-label-sm text-outline mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-label-sm text-outline mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Meal selector */}
            <div>
              <label className="block text-label-sm text-outline mb-2">Meal</label>
              <div className="flex gap-2">
                {mealOptions.map((m) => {
                  const active = selectedMeal === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMeal(m.id)}
                      className={`flex-1 py-3 rounded-xl text-label-sm font-medium transition-all active:scale-95 ${
                        active
                          ? 'bg-primary-container text-white'
                          : 'bg-surface-container-lowest border border-outline-variant text-on-background'
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add to Log */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-primary-container text-white font-semibold h-14 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Add to Log
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
