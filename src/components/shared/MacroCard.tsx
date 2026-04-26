import { Icon } from './Icon'
import { ProgressBar } from './ProgressBar'

interface MacroCardProps {
  icon: string
  value: number
  unit: string
  label: string
  progress: number
  iconColor: string
  barColor: string
}

export function MacroCard({
  icon,
  value,
  unit,
  label,
  progress,
  iconColor,
  barColor,
}: MacroCardProps) {
  const display = value < 10 ? value.toFixed(1) : Math.round(value)

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 shadow-l1">
      <Icon name={icon} size={20} className={`${iconColor} mb-1`} />
      <div className="text-headline-md font-semibold text-on-surface">
        {display}<span className="text-label-sm text-on-surface-variant ml-0.5">{unit}</span>
      </div>
      <div className="text-label-sm text-on-surface-variant mb-2">{label}</div>
      <ProgressBar value={progress} max={1} color={barColor} height="h-1" />
    </div>
  )
}
