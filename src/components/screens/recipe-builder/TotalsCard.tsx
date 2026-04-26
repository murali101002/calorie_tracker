import { ProgressBar } from '../../shared/ProgressBar'

interface MacroLine {
  label: string
  value: number
  goal: number
  color: string
}

interface TotalsCardProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  macroGoals: { protein: number; carbs: number; fat: number }
}

export function TotalsCard({ calories, protein, carbs, fat, macroGoals }: TotalsCardProps) {
  const items: MacroLine[] = [
    { label: 'Protein', value: protein, goal: macroGoals.protein, color: 'bg-macro-protein' },
    { label: 'Carbs', value: carbs, goal: macroGoals.carbs, color: 'bg-macro-carbs' },
    { label: 'Fat', value: fat, goal: macroGoals.fat, color: 'bg-macro-fat' },
  ]

  return (
    <div className="bg-surface-container rounded-2xl border border-primary-container/20 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-label-sm uppercase text-on-surface-variant">Total Calories</div>
          <div className="text-headline-lg font-semibold text-on-surface">{calories} kcal</div>
        </div>
        <span className="bg-primary-container text-on-primary text-label-sm font-medium px-3 py-1 rounded-full">
          Per Serving
        </span>
      </div>

      <div className="space-y-3 pt-3 border-t border-outline-variant/30">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-label-sm text-on-surface-variant">{item.label}</span>
              <span className="text-label-lg font-semibold text-primary">{item.value}g</span>
            </div>
            <ProgressBar
              value={item.value}
              max={item.goal}
              color={item.color}
              height="h-2"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
