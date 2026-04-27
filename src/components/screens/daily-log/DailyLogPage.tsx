import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../layout/PageShell'
import { DateNavigator } from './DateNavigator'
import { CaloriesRemainingCard } from './CaloriesRemainingCard'
import { MealSection } from './MealSection'
import { DatePickerModal } from '../../shared/DatePickerModal'
import { useFoodLogStore } from '../../../stores/useFoodLogStore'
import { useDailyProgress } from '../../../hooks/useDailyProgress'
import type { MealType, DailyLogEntry } from '../../../types'

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function DailyLogPage() {
  const navigate = useNavigate()
  const activeDate = useFoodLogStore((s) => s.activeDate)
  const setActiveDate = useFoodLogStore((s) => s.setActiveDate)
  const getEntriesByMeal = useFoodLogStore((s) => s.getEntriesByMeal)
  const getEntriesForDate = useFoodLogStore((s) => s.getEntriesForDate)
  const entries = useFoodLogStore((s) => s.entries)
  const progress = useDailyProgress(activeDate)

  const [showCalendar, setShowCalendar] = useState(false)

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

  const handleCopyLog = useCallback(
    (fromDate: string) => {
      const state = useFoodLogStore.getState()
      const sourceEntries = state.entries[fromDate] ?? []
      if (sourceEntries.length === 0) return

      const now = new Date().toISOString()
      const copiedEntries: DailyLogEntry[] = sourceEntries.map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        loggedAt: now,
      }))

      // Batch all entries + date change into a single store update
      useFoodLogStore.setState((s) => ({
        entries: {
          ...s.entries,
          [todayKey]: [...(s.entries[todayKey] ?? []), ...copiedEntries],
        },
        activeDate: todayKey,
      }))
    },
    [todayKey],
  )

  const meals: MealType[] = ['breakfast', 'lunch', 'dinner']

  return (
    <PageShell>
      <DateNavigator
        date={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        canGoNext={canGoNext}
        statusMessage={progress.statusMessage}
        onCalendarOpen={() => setShowCalendar(true)}
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

      <DatePickerModal
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDate={activeDate}
        onSelectDate={setActiveDate}
        entries={entries}
        onCopyLog={handleCopyLog}
      />
    </PageShell>
  )
}
