import { CalendarDays } from 'lucide-react'

interface DateNavigatorProps {
  date: Date
  onPrev: () => void
  onNext: () => void
  canGoNext: boolean
  statusMessage: string
  onCalendarOpen: () => void
}

export function DateNavigator({ date, onPrev, onNext, canGoNext, statusMessage, onCalendarOpen }: DateNavigatorProps) {
  const isFuture = date.getTime() > new Date().getTime()

  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <section className="flex items-center justify-between pt-6 pb-4">
      <button
        type="button"
        onClick={onPrev}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white
          shadow-sm border border-gray-100 cursor-pointer
          hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined text-primary">chevron_left</span>
      </button>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onCalendarOpen}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 active:scale-95 transition-all mb-0.5"
          aria-label="Open date picker"
        >
          <CalendarDays size={22} className="text-primary" />
        </button>
        <h1 className="text-headline-md">{dateLabel}</h1>
        <p className="text-label-sm text-outline uppercase tracking-wider">{statusMessage}</p>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext || isFuture}
        className={`w-10 h-10 flex items-center justify-center rounded-full
          bg-white shadow-sm border border-gray-100
          ${(!canGoNext || isFuture) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 transition-colors'}`}
      >
        <span className="material-symbols-outlined text-primary">chevron_right</span>
      </button>
    </section>
  )
}
