import { Icon } from './Icon'

interface FoodCardProps {
  icon: string
  name: string
  description: string
  calories: number
  onClick?: () => void
}

export function FoodCard({ icon, name, description, calories, onClick }: FoodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-l1 flex items-center gap-3
        active:scale-[0.98] transition-transform cursor-pointer border border-transparent
        hover:border-primary-container/20 text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
        <Icon name={icon} size={24} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-lg font-semibold text-on-surface">{name}</div>
        <div className="text-body-md text-on-surface-variant">{description}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-headline-md font-semibold text-on-surface">{calories}</div>
        <div className="text-label-sm text-on-surface-variant">kcal</div>
      </div>
    </button>
  )
}
