interface ProgressBarProps {
  value: number
  max: number
  color: string
  height?: string
}

export function ProgressBar({ value, max, color, height = 'h-1.5' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className={`w-full ${height} rounded-full bg-surface-container overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
