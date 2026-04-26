import { useDailyProgress } from '../../../hooks/useDailyProgress'

interface CaloriesRemainingCardProps {
  date: string
}

export function CaloriesRemainingCard({ date }: CaloriesRemainingCardProps) {
  const progress = useDailyProgress(date)

  const isOver = progress.remaining < 0
  const displayRemaining = Math.abs(progress.remaining).toLocaleString()
  const displayGoal = progress.protein.goal.toLocaleString()
  const progressPct = Math.round(Math.min(progress.progress, 1) * 100)

  // SVG ring: r=34, circumference = 2*PI*34 ≈ 213.6
  const circumference = 2 * Math.PI * 34
  const dashoffset = circumference * (1 - Math.min(progress.progress, 1))

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-l1 space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-label-lg text-outline">Calories Remaining</p>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg text-primary">{displayRemaining}</span>
            <span className="text-body-md text-outline">/ {displayGoal} kcal</span>
            {isOver && <span className="text-label-sm text-error">over</span>}
          </div>
        </div>
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" fill="transparent" r="34" stroke="#e5eeff" strokeWidth="8" />
            <circle
              cx="40" cy="40" fill="transparent" r="34"
              stroke={isOver ? '#ba1a1a' : '#22c55e'}
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round" strokeWidth="8"
            />
          </svg>
          <span className="absolute text-label-sm font-bold">{progressPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-label-sm">
            <span className="text-outline">Protein</span>
            <span className="text-on-background">{Math.round(progress.protein.current)}g</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-macro-protein rounded-full" style={{ width: `${Math.round(progress.protein.pct * 100)}%` }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-label-sm">
            <span className="text-outline">Carbs</span>
            <span className="text-on-background">{Math.round(progress.carbs.current)}g</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-macro-carbs rounded-full" style={{ width: `${Math.round(progress.carbs.pct * 100)}%` }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-label-sm">
            <span className="text-outline">Fat</span>
            <span className="text-on-background">{Math.round(progress.fat.current)}g</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-macro-fat rounded-full" style={{ width: `${Math.round(progress.fat.pct * 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
