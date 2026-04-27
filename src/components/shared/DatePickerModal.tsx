import { useState, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DailyLogEntry } from '../../types'

interface DatePickerModalProps {
  open: boolean
  onClose: () => void
  selectedDate: string
  onSelectDate: (date: string) => void
  entries: Record<string, DailyLogEntry[]>
  onCopyLog: (fromDate: string) => void
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function DatePickerModal({
  open,
  onClose,
  selectedDate,
  onSelectDate,
  entries,
  onCopyLog,
}: DatePickerModalProps) {
  const today = useMemo(() => {
    const d = new Date()
    return toDateKey(d.getFullYear(), d.getMonth(), d.getDate())
  }, [])

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [confirmCopy, setConfirmCopy] = useState<string | null>(null)

  if (!open) return null

  const earliestMonth = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return { year: d.getFullYear(), month: d.getMonth() }
  })()

  const canGoPrev =
    viewYear > earliestMonth.year ||
    (viewYear === earliestMonth.year && viewMonth > earliestMonth.month)

  const canGoNext = (() => {
    const todayDate = new Date()
    const todayYear = todayDate.getFullYear()
    const todayMonth = todayDate.getMonth()
    return viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth)
  })()

  function handlePrev() {
    if (!canGoPrev) return
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function handleNext() {
    if (!canGoNext) return
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateKey = toDateKey(viewYear, viewMonth, day)
    const isToday = dateKey === today
    const isSelected = dateKey === selectedDate
    const isFuture = dateKey > today

    const d = new Date(viewYear, viewMonth, day)
    const isBeforeEarliest =
      d <
      new Date(
        earliestMonth.year,
        earliestMonth.month,
        1,
      )

    return { day, dateKey, isToday, isSelected, isFuture, isBeforeEarliest }
  })

  const selectedHasEntries =
    selectedDate !== today &&
    (entries[selectedDate]?.length ?? 0) > 0

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function handleDayClick(dateKey: string, isDisabled: boolean) {
    if (isDisabled) return
    onClose()
    // Defer store update so React processes the close before the date change re-render
    queueMicrotask(() => onSelectDate(dateKey))
  }

  function handleCopyConfirm() {
    if (!confirmCopy) return
    onCopyLog(confirmCopy)
    setConfirmCopy(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-headline-md text-on-background">Select Date</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:scale-95 transition-all"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30"
          >
            <ChevronLeft size={22} className="text-primary" />
          </button>
          <span className="text-body-lg font-semibold text-on-background">{monthLabel}</span>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30"
          >
            <ChevronRight size={22} className="text-primary" />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 px-4 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-label-sm text-outline py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-4 gap-y-1">
          {/* Empty cells for first row offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {dayCells.map(({ day, dateKey, isToday, isSelected, isFuture, isBeforeEarliest }) => {
            const isDisabled = isFuture || isBeforeEarliest
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleDayClick(dateKey, isDisabled)}
                disabled={isDisabled}
                className={`aspect-square flex items-center justify-center rounded-full text-body-lg
                  transition-all active:scale-90
                  ${isSelected
                    ? 'bg-[#22c55e] text-white font-semibold'
                    : isToday
                      ? 'text-[#22c55e] font-semibold border-2 border-[#22c55e]'
                      : isDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-on-background hover:bg-gray-100'
                  }`}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Copy log section */}
        <div className="px-6 py-4 mt-2 mb-6">
          {confirmCopy ? (
            <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
              <p className="text-body-md text-on-background leading-relaxed">
                Copy{' '}
                <strong>
                  {new Date(confirmCopy + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </strong>{' '}
                log to <strong>today</strong>? This will add to today&apos;s existing entries.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmCopy(null)}
                  className="flex-1 py-3 rounded-full border border-outline-variant text-outline text-label-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCopyConfirm}
                  className="flex-1 py-3 rounded-full bg-[#22c55e] text-white text-label-lg font-semibold active:scale-95 transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
          ) : selectedHasEntries ? (
            <button
              type="button"
              onClick={() => setConfirmCopy(selectedDate)}
              className="w-full py-3 rounded-full bg-surface-container border border-outline-variant text-on-background text-label-lg font-medium hover:bg-surface-container-high active:scale-95 transition-all"
            >
              Copy log from this date
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
