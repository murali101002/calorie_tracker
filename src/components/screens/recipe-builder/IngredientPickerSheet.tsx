import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ManualIngredient {
  name: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface IngredientPickerSheetProps {
  open: boolean
  onClose: () => void
  onAddManual: (ingredient: ManualIngredient) => void
}

export function IngredientPickerSheet({ open, onClose, onAddManual }: IngredientPickerSheetProps) {
  const navigate = useNavigate()
  const [showManualForm, setShowManualForm] = useState(false)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('100')
  const [unit, setUnit] = useState('g')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function resetForm() {
    setName('')
    setAmount('100')
    setUnit('g')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setErrors({})
    setShowManualForm(false)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function parseNumeric(value: string): number {
    const n = parseFloat(value)
    return isNaN(n) ? 0 : n
  }

  function handleSaveManual() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!calories || parseFloat(calories) <= 0) errs.calories = 'Calories must be greater than 0'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onAddManual({
      name: name.trim(),
      amount: parseFloat(amount) || 100,
      unit,
      calories: parseNumeric(calories),
      protein: parseNumeric(protein),
      carbs: parseNumeric(carbs),
      fat: parseNumeric(fat),
    })
    resetForm()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-[env(safe-area-inset-bottom,20px)] animate-slide-up max-h-[85dvh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="w-8" />
            <h2 className="text-headline-sm text-on-background">Add Ingredient</h2>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {showManualForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-label-sm text-outline mb-1">Ingredient Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicken Breast"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
                {errors.name && <p className="text-error text-label-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-label-sm text-outline mb-1">Serving Size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="g"
                    className="w-24 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                  />
                </div>
              </div>

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

              <button
                type="button"
                onClick={handleSaveManual}
                className="w-full bg-primary-container text-white font-semibold h-14 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Save Ingredient
              </button>

              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="w-full flex items-center justify-center gap-2 py-3 text-outline font-medium active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to options
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  navigate('/scan', { state: { returnTo: 'recipe-builder' } })
                  handleClose()
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">barcode_scanner</span>
                </div>
                <div className="text-left flex-1">
                  <p className="text-body-lg font-semibold">Scan Barcode</p>
                  <p className="text-body-sm text-outline">Scan a product barcode to add its nutrition info</p>
                </div>
                <span className="material-symbols-outlined text-outline text-xl">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/search', { state: { returnTo: 'recipe-builder' } })
                  handleClose()
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-2xl">search</span>
                </div>
                <div className="text-left flex-1">
                  <p className="text-body-lg font-semibold">Search Food Database</p>
                  <p className="text-body-sm text-outline">Find a food in the nutrition database</p>
                </div>
                <span className="material-symbols-outlined text-outline text-xl">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">edit_note</span>
                </div>
                <div className="text-left flex-1">
                  <p className="text-body-lg font-semibold">Enter Manually</p>
                  <p className="text-body-sm text-outline">Type in the nutrition values yourself</p>
                </div>
                <span className="material-symbols-outlined text-outline text-xl">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
