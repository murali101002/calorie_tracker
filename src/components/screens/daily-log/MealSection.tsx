import type { DailyLogEntry, MealType } from '../../../types'
import { EmptyState } from '../../shared/EmptyState'

interface MealSectionProps {
  mealType: MealType
  entries: DailyLogEntry[]
  onAdd: () => void
  onEntryClick: (id: string) => void
}

const mealMeta: Record<MealType, { label: string; emptyIcon: string }> = {
  breakfast: { label: 'Breakfast', emptyIcon: 'free_breakfast' },
  lunch: { label: 'Lunch', emptyIcon: 'lunch_dining' },
  dinner: { label: 'Dinner', emptyIcon: 'dinner_dining' },
  snack: { label: 'Snack', emptyIcon: 'bakery_dining' },
}

export function MealSection({ mealType, entries, onAdd, onEntryClick }: MealSectionProps) {
  const { label, emptyIcon } = mealMeta[mealType]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[20px] font-semibold text-on-background">{label}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-container text-white
            active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={emptyIcon} message="No entries yet" />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onEntryClick(entry.id)}
              className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center
                justify-between border border-transparent hover:border-primary-container/20
                transition-colors cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{entry.icon}</span>
                </div>
                <div>
                  <h3 className="text-body-lg font-semibold">{entry.name}</h3>
                  <p className="text-body-md text-outline">{entry.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-body-lg font-semibold">{entry.calories}</span>
                <span className="text-label-sm text-outline"> kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
