import type { ServingUnit, MealType } from '../../../types'

const servingUnits: { id: ServingUnit; label: string }[] = [
  { id: 'cup', label: 'Cup (245g)' },
  { id: 'container', label: 'Container (150g)' },
  { id: 'ounce', label: 'Ounce (28g)' },
  { id: 'gram', label: 'Grams (1g)' },
]

const mealTypes: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
]

interface ServingInputProps {
  amount: number
  unit: ServingUnit
  onAmountChange: (v: number) => void
  onUnitChange: (v: ServingUnit) => void
  selectedMeal: MealType
  onMealChange: (v: MealType) => void
}

export function ServingInput({
  amount,
  unit,
  onAmountChange,
  onUnitChange,
  selectedMeal,
  onMealChange,
}: ServingInputProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Serving Size */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-l1">
        <label className="text-label-sm text-outline block mb-2">Serving Size</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0.25}
            step={0.25}
            value={amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value) || 1)}
            className="w-1/3 bg-surface text-headline-md rounded-lg border-none
              focus:ring-2 focus:ring-primary-container p-2 text-center"
          />
          <div className="flex-1 relative">
            <select
              value={unit}
              onChange={(e) => onUnitChange(e.target.value as ServingUnit)}
              className="w-full appearance-none bg-surface border-none text-body-lg rounded-lg
                focus:ring-2 focus:ring-primary-container p-2 pr-10 cursor-pointer"
            >
              {servingUnits.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Meal Type Chip Toggle */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-l1">
        <label className="text-label-sm text-outline block mb-2">Log to Meal</label>
        <div className="flex flex-wrap gap-1">
          {mealTypes.map((m) => {
            const selected = m.id === selectedMeal
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onMealChange(m.id)}
                className={`px-3 py-1.5 text-label-lg rounded-full active:scale-95
                  transition-all cursor-pointer
                  ${selected
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface text-outline border border-outline-variant hover:border-primary'
                  }`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
