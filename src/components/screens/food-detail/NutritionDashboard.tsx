interface NutritionDashboardProps {
  energy: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  macroGoals: { protein: number; carbs: number; fat: number; fiber: number }
}

function pct(current: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.min((current / goal) * 100, 100)
}

export function NutritionDashboard({
  energy, protein, carbs, fat, fiber, macroGoals,
}: NutritionDashboardProps) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Main Calories Card */}
      <div className="col-span-12 md:col-span-4 bg-primary-container text-white p-6 rounded-2xl
        flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <span className="material-symbols-outlined text-[120px]">bolt</span>
        </div>
        <p className="text-label-lg mb-1 opacity-90">Energy</p>
        <h2 className="text-[56px] font-headline-lg leading-none">{energy}</h2>
        <p className="text-label-lg tracking-[0.2em] mt-1">KCAL</p>
      </div>

      {/* Macro Grid */}
      <div className="col-span-12 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MacroMini
          icon="fitness_center"
          iconColor="text-macro-protein"
          iconBg="bg-macro-protein/10"
          value={protein}
          unit="g"
          label="Protein"
          pct={pct(protein, macroGoals.protein)}
          barColor="bg-macro-protein"
        />
        <MacroMini
          icon="bakery_dining"
          iconColor="text-macro-carbs"
          iconBg="bg-macro-carbs/10"
          value={carbs}
          unit="g"
          label="Carbs"
          pct={pct(carbs, macroGoals.carbs)}
          barColor="bg-macro-carbs"
        />
        <MacroMini
          icon="opacity"
          iconColor="text-macro-fat"
          iconBg="bg-macro-fat/10"
          value={fat}
          unit="g"
          label="Fat"
          pct={pct(fat, macroGoals.fat)}
          barColor="bg-macro-fat"
        />
        <MacroMini
          icon="grass"
          iconColor="text-primary-container"
          iconBg="bg-primary-container/10"
          value={fiber}
          unit="g"
          label="Fiber"
          pct={pct(fiber, macroGoals.fiber)}
          barColor="bg-primary-container"
        />
      </div>
    </div>
  )
}

function MacroMini({
  icon, iconColor, iconBg, value, unit, label, pct, barColor,
}: {
  icon: string; iconColor: string; iconBg: string;
  value: number; unit: string; label: string; pct: number; barColor: string;
}) {
  const display = value < 10 ? value.toFixed(1) : Math.round(value)
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant
      shadow-sm flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mb-2`}>
        <span className={`material-symbols-outlined ${iconColor} text-lg`}>{icon}</span>
      </div>
      <span className="text-headline-md">{display}{unit}</span>
      <span className="text-label-sm text-outline">{label}</span>
      <div className="w-full bg-surface-container h-1 rounded-full mt-2 overflow-hidden">
        <div className={`${barColor} h-full rounded-full`} style={{ width: `${Math.round(pct)}%` }} />
      </div>
    </div>
  )
}
