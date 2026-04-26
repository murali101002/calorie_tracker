import { ProgressBar } from './ProgressBar'

interface MacroBarProps {
  label: string
  current: number
  goal: number
  unit: string
  color: string
}

export function MacroBar({ label, current, goal, unit, color }: MacroBarProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-label-sm text-on-surface-variant">{label}</span>
        <span className="text-label-sm text-on-surface">
          <span className="font-semibold">{Math.round(current)}{unit}</span>
          <span className="text-on-surface-variant"> / {goal}{unit}</span>
        </span>
      </div>
      <ProgressBar value={current} max={goal} color={color} />
    </div>
  )
}
