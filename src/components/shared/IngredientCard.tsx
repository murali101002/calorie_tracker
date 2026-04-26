interface IngredientCardProps {
  imageUrl: string
  name: string
  amount: string
  calories: number
  onRemove: () => void
}

export function IngredientCard({ imageUrl, name, amount, calories, onRemove }: IngredientCardProps) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4
      border border-transparent hover:border-primary-container transition-all"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
        <img alt={name} className="w-full h-full object-cover" src={imageUrl} loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-lg font-semibold">{name}</p>
        <p className="text-label-sm text-outline">{amount} • {calories} kcal</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer hover:text-error transition-colors"
      >
        <span className="material-symbols-outlined text-outline">close</span>
      </button>
    </div>
  )
}
