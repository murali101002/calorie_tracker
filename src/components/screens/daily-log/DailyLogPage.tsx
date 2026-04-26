import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../layout/PageShell'
import { DateNavigator } from './DateNavigator'
import { CaloriesRemainingCard } from './CaloriesRemainingCard'
import { MealSection } from './MealSection'
import { useFoodLogStore } from '../../../stores/useFoodLogStore'
import { useDailyProgress } from '../../../hooks/useDailyProgress'
import type { MealType } from '../../../types'

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function DailyLogPage() {
  const navigate = useNavigate()
  const activeDate = useFoodLogStore((s) => s.activeDate)
  const setActiveDate = useFoodLogStore((s) => s.setActiveDate)
  const getEntriesByMeal = useFoodLogStore((s) => s.getEntriesByMeal)
  const getEntriesForDate = useFoodLogStore((s) => s.getEntriesForDate)
  const progress = useDailyProgress(activeDate)

  useEffect(() => {
    const state = useFoodLogStore.getState()
    if (Object.keys(state.entries).length === 0) {
      state.seedSampleData()
    }
  }, [])

  const currentDate = new Date(activeDate + 'T12:00:00')
  const today = new Date()
  const todayKey = toDateKey(today)
  const canGoNext = activeDate < todayKey

  function handlePrev() {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 1)
    setActiveDate(toDateKey(d))
  }

  function handleNext() {
    if (!canGoNext) return
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    setActiveDate(toDateKey(d))
  }

  const meals: MealType[] = ['breakfast', 'lunch', 'dinner']

  return (
    <PageShell>
      <DateNavigator
        date={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        canGoNext={canGoNext}
        statusMessage={progress.statusMessage}
      />

      <div className="mb-6">
        <CaloriesRemainingCard date={activeDate} />
      </div>

      <div className="space-y-6 pb-4">
        {meals.map((meal) => (
          <MealSection
            key={meal}
            mealType={meal}
            entries={getEntriesByMeal(activeDate, meal)}
            onAdd={() => navigate('/scan')}
            onEntryClick={(id) => {
              const entry = getEntriesForDate(activeDate).find((e) => e.id === id)
              if (entry) navigate(`/food/${entry.foodId}`)
            }}
          />
        ))}
      </div>
    </PageShell>
  )
}
