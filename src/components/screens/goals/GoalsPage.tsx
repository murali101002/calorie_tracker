import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../layout/PageShell'
import { Toast } from '../../shared/Toast'
import { useUserStore } from '../../../stores/useUserStore'
import type { ActivityLevel } from '../../../types'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
}

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly active',
  moderately_active: 'Moderately active',
  very_active: 'Very active',
  athlete: 'Athlete',
}

function computeBMR(weight: number, height: number, age: number, gender: string): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'female' ? base - 161 : base + 5
}

function computeTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

function computeTargetCalories(tdee: number, currentWeight: number, goalWeight: number): number {
  if (goalWeight < currentWeight) return tdee - 500
  if (goalWeight > currentWeight) return tdee + 300
  return tdee
}

function computeWeeksToGoal(currentWeight: number, goalWeight: number, targetCalories: number, tdee: number): number | null {
  const dailyDelta = Math.abs(targetCalories - tdee)
  if (dailyDelta === 0) return null
  const totalKcalToShift = Math.abs(currentWeight - goalWeight) * 7700
  return totalKcalToShift / dailyDelta / 7
}

function isProfileComplete(profile: { age: number; height: number; weight: number }): boolean {
  return profile.age >= 10 && profile.height >= 100 && profile.weight >= 30
}

export function GoalsPage() {
  const profile = useUserStore((s) => s.profile)
  const updateGoals = useUserStore((s) => s.updateGoals)
  const navigate = useNavigate()

  const [toastVisible, setToastVisible] = useState(false)

  if (!isProfileComplete(profile)) {
    return (
      <PageShell>
        <h1 className="text-headline-md mb-8">Goals</h1>
        <div className="bg-surface-container-lowest rounded-2xl p-6 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-outline">fitness_center</span>
          <p className="text-body-lg text-on-background">Complete your profile first</p>
          <p className="text-body-md text-outline">We need your age, height, and weight to calculate your goals.</p>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-full font-semibold active:scale-95 transition-all"
          >
            Go to Profile
          </button>
        </div>
      </PageShell>
    )
  }

  const bmr = computeBMR(profile.weight, profile.height, profile.age, profile.gender)
  const tdee = computeTDEE(bmr, profile.activityLevel)
  const targetCalories = computeTargetCalories(tdee, profile.weight, profile.goalWeight)
  const weeksToGoal = computeWeeksToGoal(profile.weight, profile.goalWeight, targetCalories, tdee)

  // Macro split
  const protein = Math.round(2 * profile.weight)
  const fat = Math.round((targetCalories * 0.25) / 9)
  const proteinCal = protein * 4
  const fatCal = fat * 9
  const carbs = Math.round((targetCalories - proteinCal - fatCal) / 4)
  const fiber = 25

  const isDeficit = targetCalories < tdee
  const isSurplus = targetCalories > tdee
  const goalLabel = isDeficit ? 'Calorie Deficit' : isSurplus ? 'Calorie Surplus' : 'Maintenance'
  const deltaLabel = isDeficit ? `-${tdee - targetCalories} kcal` : isSurplus ? `+${targetCalories - tdee} kcal` : '0 kcal'

  const macroCards = [
    { label: 'Protein', value: protein, unit: 'g', color: 'bg-blue-500', calPerGram: 4, cals: protein * 4 },
    { label: 'Carbs', value: carbs, unit: 'g', color: 'bg-orange-400', calPerGram: 4, cals: carbs * 4 },
    { label: 'Fat', value: fat, unit: 'g', color: 'bg-red-500', calPerGram: 9, cals: fat * 9 },
    { label: 'Fiber', value: fiber, unit: 'g', color: 'bg-green-500', calPerGram: 0, cals: 0 },
  ]

  function handleApply() {
    updateGoals({
      calories: targetCalories,
      protein,
      carbs,
      fat,
      fiber,
      tdee,
      targetCalories,
    })
    setToastVisible(true)
  }

  return (
    <PageShell>
      <h1 className="text-headline-md mb-8">Goals</h1>

      <div className="space-y-6 pb-6">
        {/* TDEE Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Energy Expenditure</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-sm text-outline">BMR</p>
              <p className="text-headline-sm text-on-background">{Math.round(bmr)}</p>
              <p className="text-label-sm text-outline">kcal/day</p>
            </div>
            <span className="material-symbols-outlined text-outline">add</span>
            <div>
              <p className="text-label-sm text-outline">Activity</p>
              <p className="text-headline-sm text-on-background">×{ACTIVITY_MULTIPLIERS[profile.activityLevel]}</p>
              <p className="text-label-sm text-outline">{ACTIVITY_LABELS[profile.activityLevel]}</p>
            </div>
            <span className="material-symbols-outlined text-outline">equal</span>
            <div>
              <p className="text-label-sm text-outline">TDEE</p>
              <p className="text-headline-sm text-primary">{tdee}</p>
              <p className="text-label-sm text-outline">kcal/day</p>
            </div>
          </div>
        </section>

        {/* Target Calories */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Target Calories</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-sm text-outline">TDEE</p>
              <p className="text-headline-sm text-on-background">{tdee}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-label-sm font-semibold ${
              isDeficit ? 'bg-red-100 text-red-700' : isSurplus ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {deltaLabel}
            </span>
            <div>
              <p className="text-label-sm text-outline">Target</p>
              <p className="text-headline-sm text-primary">{targetCalories}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-label-sm font-medium ${
              isDeficit ? 'bg-red-100 text-red-700' : isSurplus ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {goalLabel}
            </span>
            {weeksToGoal !== null && (
              <p className="text-body-sm text-outline">
                Est. {weeksToGoal < 1 ? '< 1 week' : `${Math.round(weeksToGoal)} weeks`} to goal
              </p>
            )}
            {weeksToGoal === null && (
              <p className="text-body-sm text-outline">Maintaining current weight</p>
            )}
          </div>
        </section>

        {/* Macro Split */}
        <section className="space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Macro Split</h2>
          <div className="grid grid-cols-2 gap-4">
            {macroCards.map((m) => (
              <div key={m.label} className="bg-surface-container-lowest rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${m.color}`} />
                  <p className="text-label-sm text-outline">{m.label}</p>
                </div>
                <div>
                  <p className="text-headline-sm text-on-background">{m.value}<span className="text-body-lg text-outline">g</span></p>
                  {m.cals > 0 && <p className="text-label-sm text-outline">{m.cals} kcal</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-label-sm text-outline text-center px-4">
          These estimates use the Mifflin-St Jeor equation. Actual needs may vary based on genetics, medical conditions, and lifestyle. Consult a dietitian for personalized advice.
        </p>

        {/* Apply Button */}
        <button
          type="button"
          onClick={handleApply}
          className="w-full bg-primary-container text-white font-semibold h-14 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          Apply Goals
        </button>
      </div>

      <Toast
        message="Goals applied"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </PageShell>
  )
}
