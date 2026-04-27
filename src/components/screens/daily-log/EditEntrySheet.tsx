import { useState, useCallback, useEffect } from 'react'
import { useFoodLogStore } from '../../../stores/useFoodLogStore'
import type { DailyLogEntry, MealType, ServingUnit } from '../../../types'

interface EditEntrySheetProps {
  open: boolean
  entry: DailyLogEntry | null
  date: string
  onClose: () => void
}

const mealOptions: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
]

export function EditEntrySheet({ open, entry, date, onClose }: EditEntrySheetProps) {
  const [name, setName] = useState('')
  const [servingAmount, setServingAmount] = useState('')
  const [servingUnit, setServingUnit] = useState('g')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (entry) {
      setName(entry.name)
      setServingAmount(String(entry.servingAmount))
      setServingUnit(entry.servingUnit)
      setCalories(String(entry.calories))
      setProtein(String(entry.protein || ''))
      setCarbs(String(entry.carbs || ''))
      setFat(String(entry.fat || ''))
      setSelectedMeal(entry.mealType)
      setErrors({})
      setShowDeleteConfirm(false)
    }
  }, [entry])

  function parseNumeric(value: string): number {
    const n = parseFloat(value)
    return isNaN(n) ? 0 : n
  }

  const handleSave = useCallback(() => {
    if (!entry) return
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Food name is required'
    const calNum = parseFloat(calories)
    if (!calories || isNaN(calNum) || calNum <= 0) errs.calories = 'Calories must be greater than 0'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    useFoodLogStore.getState().updateEntry(date, entry.id, {
      name: name.trim(),
      description: `${servingAmount || '1'} ${servingUnit}`,
      calories: calNum,
      protein: parseNumeric(protein),
      carbs: parseNumeric(carbs),
      fat: parseNumeric(fat),
      servingAmount: parseFloat(servingAmount) || 1,
      servingUnit: servingUnit as ServingUnit,
      mealType: selectedMeal,
    })

    onClose()
  }, [entry, date, name, servingAmount, servingUnit, calories, protein, carbs, fat, selectedMeal, onClose])

  const handleDelete = useCallback(() => {
    if (!entry) return
    useFoodLogStore.getState().removeEntry(date, entry.id)
    onClose()
  }, [entry, date, onClose])

  if (!open || !entry) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-[env(safe-area-inset-bottom,20px)] animate-slide-up max-h-[85dvh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="w-8" />
            <h2 className="text-headline-sm text-on-background">Edit Entry</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {showDeleteConfirm ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-red-500 text-4xl mb-2 block">delete_forever</span>
                <p className="text-body-lg font-semibold text-red-700">Remove {entry.name} from your log?</p>
                <p className="text-body-sm text-red-500 mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 rounded-full bg-gray-100 text-on-background font-semibold active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-4 rounded-full bg-red-500 text-white font-semibold active:scale-95 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <>
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

              {/* Save Changes */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full bg-primary-container text-white font-semibold h-14 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Save Changes
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-medium active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">delete</span>
                Delete Entry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
