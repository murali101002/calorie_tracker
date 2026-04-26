interface DateNavigatorProps {
  date: Date
  onPrev: () => void
  onNext: () => void
  canGoNext: boolean
  statusMessage: string
}

export function DateNavigator({ date, onPrev, onNext, canGoNext, statusMessage }: DateNavigatorProps) {
  const today = new Date()
  const isToday = date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
  const isFuture = date.getTime() > today.getTime()

  const dayLabel = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <section className="flex items-center justify-between pt-6 pb-4">
      <button
        type="button"
        onClick={onPrev}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest
          shadow-sm border border-outline-variant/20 cursor-pointer
          hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-primary">chevron_left</span>
      </button>

      <div className="text-center">
        <h1 className="text-headline-md">{dayLabel}, {dateLabel}</h1>
        <p className="text-label-sm text-outline uppercase tracking-wider">{statusMessage}</p>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext || isFuture}
        className={`w-10 h-10 flex items-center justify-center rounded-full
          bg-surface-container-lowest shadow-sm border border-outline-variant/20
          ${(!canGoNext || isFuture) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-container-low transition-colors'}`}
      >
        <span className="material-symbols-outlined text-primary">chevron_right</span>
      </button>
    </section>
  )
}
