import { useState, useRef, useCallback } from 'react'
import type { DailyLogEntry, MealType } from '../../../types'
import { EmptyState } from '../../shared/EmptyState'

interface MealSectionProps {
  mealType: MealType
  entries: DailyLogEntry[]
  onAdd: () => void
  onEdit: (entry: DailyLogEntry) => void
}

const mealMeta: Record<MealType, { label: string; emptyIcon: string }> = {
  breakfast: { label: 'Breakfast', emptyIcon: 'free_breakfast' },
  lunch: { label: 'Lunch', emptyIcon: 'lunch_dining' },
  dinner: { label: 'Dinner', emptyIcon: 'dinner_dining' },
  snack: { label: 'Snack', emptyIcon: 'bakery_dining' },
}

interface EntryRowProps {
  entry: DailyLogEntry
  onEdit: (entry: DailyLogEntry) => void
}

function EntryRow({ entry, onEdit }: EntryRowProps) {
  const [showActions, setShowActions] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStart = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 })
  const moved = useRef(false)

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    moved.current = false

    longPressTimer.current = setTimeout(() => {
      if (!moved.current) {
        setShowActions(true)
      }
    }, 500)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStart.current.x)
    const dy = Math.abs(touch.clientY - touchStart.current.y)
    if (dx > 10 || dy > 10) {
      moved.current = true
      clearLongPress()
    }
  }, [clearLongPress])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    clearLongPress()
    const touch = e.changedTouches[0]
    const dx = touchStart.current.x - touch.clientX
    const elapsed = Date.now() - touchStart.current.time

    // Swipe left: delta > 50px
    if (dx > 50 && !moved.current) {
      setShowActions(true)
      return
    }

    // Short tap: < 300ms, minimal movement
    if (elapsed < 300 && !moved.current && dx < 10) {
      onEdit(entry)
    }
  }, [clearLongPress, entry, onEdit])

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action buttons revealed behind */}
      {showActions && (
        <div className="absolute inset-0 flex items-center justify-end gap-2 pr-4 bg-gray-50 z-0">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-blue-500 text-white text-label-sm font-medium active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </button>
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-label-sm font-medium active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>
        </div>
      )}

      {/* Main entry row */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (showActions) {
            setShowActions(false)
          }
        }}
        className={`bg-white p-4 shadow-sm flex items-center
          justify-between border border-transparent
          transition-all cursor-pointer active:scale-[0.98] relative z-10
          ${showActions ? 'translate-x-[-140px]' : 'translate-x-0'}`}
        style={{ transitionDuration: '200ms' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">{entry.icon}</span>
          </div>
          <div>
            <h3 className="text-body-lg font-semibold">{entry.name}</h3>
            <p className="text-body-md text-outline">{entry.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-body-lg font-semibold">{entry.calories}</span>
          <span className="text-label-sm text-outline"> kcal</span>
        </div>
      </div>
    </div>
  )
}

export function MealSection({ mealType, entries, onAdd, onEdit }: MealSectionProps) {
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
            <EntryRow key={entry.id} entry={entry} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  )
}
