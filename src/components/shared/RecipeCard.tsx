interface RecipeCardProps {
  imageUrl: string
  name: string
  calories: number
  prepTime: string
  protein: number
  carbs: number
  fat: number
  onClick: () => void
}

export function RecipeCard({
  imageUrl, name, calories, prepTime, protein, carbs, fat, onClick,
}: RecipeCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-surface-container-lowest rounded-xl p-4 flex gap-4 cursor-pointer
        active:scale-[0.98] transition-transform"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
        <img alt={name} className="w-full h-full object-cover" src={imageUrl} loading="lazy" />
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="text-body-lg font-semibold text-on-background mb-1">{name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-primary text-label-lg">{calories} kcal</span>
            <span className="text-outline-variant text-xs">•</span>
            <span className="text-outline text-label-sm">{prepTime}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex flex-col">
            <span className="text-outline text-[10px] uppercase">Prot</span>
            <span className="text-on-surface text-label-lg">{protein}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-outline text-[10px] uppercase">Carb</span>
            <span className="text-on-surface text-label-lg">{carbs}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-outline text-[10px] uppercase">Fat</span>
            <span className="text-on-surface text-label-lg">{fat}g</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <span className="material-symbols-outlined text-outline">chevron_right</span>
      </div>
    </div>
  )
}
