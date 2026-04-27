import { useState, useCallback } from 'react'
import { PageShell } from '../../layout/PageShell'
import { Toast } from '../../shared/Toast'
import { useUserStore } from '../../../stores/useUserStore'
import type { ActivityLevel } from '../../../types'

const CM_PER_INCH = 2.54
const KG_PER_LB = 0.45359237

function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return { feet, inches }
}

function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * CM_PER_INCH)
}

function kgToLbs(kg: number): number {
  return Math.round(kg / KG_PER_LB)
}

function lbsToKg(lbs: number): number {
  return Math.round(lbs * KG_PER_LB)
}

const activityOptions: { id: ActivityLevel; label: string; description: string }[] = [
  { id: 'sedentary', label: 'Sedentary', description: 'Desk job, no exercise' },
  { id: 'lightly_active', label: 'Lightly active', description: '1–3x/week' },
  { id: 'moderately_active', label: 'Moderately active', description: '3–5x/week' },
  { id: 'very_active', label: 'Very active', description: '6–7x/week' },
  { id: 'athlete', label: 'Athlete', description: '2x/day' },
]

const dietaryTags = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free',
  'Keto', 'Paleo', 'Halal', 'Kosher', 'Nut Allergy', 'Low Sodium', 'Diabetic-Friendly',
] as const

export function ProfilePage() {
  const profile = useUserStore((s) => s.profile)
  const updateProfile = useUserStore((s) => s.updateProfile)

  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(String(profile.age))
  const [sex, setSex] = useState<'male' | 'female'>(profile.gender === 'female' ? 'female' : 'male')

  const [isHeightMetric, setIsHeightMetric] = useState(true)
  const heightFtInit = cmToFeetInches(profile.height)
  const [heightCm, setHeightCm] = useState(String(profile.height))
  const [heightFt, setHeightFt] = useState(String(heightFtInit.feet))
  const [heightIn, setHeightIn] = useState(String(heightFtInit.inches))

  const [isWeightMetric, setIsWeightMetric] = useState(true)
  const [weight, setWeight] = useState(String(profile.weight))
  const [goalWeight, setGoalWeight] = useState(String(profile.goalWeight))

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel)
  const [preferences, setPreferences] = useState<string[]>(profile.preferences ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toastVisible, setToastVisible] = useState(false)

  const currentWeightUnit = isWeightMetric ? 'kg' : 'lbs'

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {}

    const ageNum = parseInt(age, 10)
    if (!age || isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      errs.age = 'Age must be between 10 and 100'
    }

    if (isHeightMetric) {
      const cm = parseInt(heightCm, 10)
      if (!heightCm || isNaN(cm) || cm < 100 || cm > 250) {
        errs.height = 'Height must be between 100 and 250 cm'
      }
    } else {
      const ft = parseInt(heightFt, 10)
      const inch = parseInt(heightIn, 10)
      if (isNaN(ft) || isNaN(inch) || ft < 3 || ft > 8 || inch < 0 || inch > 11) {
        errs.height = 'Enter a valid height (3\'0" – 8\'11")'
      }
    }

    const weightMin = isWeightMetric ? 30 : 66
    const weightMax = isWeightMetric ? 300 : 660
    const weightNum = parseFloat(weight)
    if (!weight || isNaN(weightNum) || weightNum < weightMin || weightNum > weightMax) {
      errs.weight = `Weight must be between ${weightMin} and ${weightMax} ${currentWeightUnit}`
    }

    const goalNum = parseFloat(goalWeight)
    if (!goalWeight || isNaN(goalNum) || goalNum <= 0) {
      errs.goalWeight = 'Goal weight cannot be 0'
    } else if (goalNum < weightMin || goalNum > weightMax) {
      errs.goalWeight = `Goal weight must be between ${weightMin} and ${weightMax} ${currentWeightUnit}`
    }

    return errs
  }, [age, heightCm, heightFt, heightIn, isHeightMetric, weight, goalWeight, isWeightMetric, currentWeightUnit])

  const handleSave = useCallback(() => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const height = isHeightMetric
      ? parseInt(heightCm, 10)
      : feetInchesToCm(parseInt(heightFt, 10), parseInt(heightIn, 10))
    const weightKg = isWeightMetric
      ? parseFloat(weight)
      : lbsToKg(parseFloat(weight))
    const goalKg = isWeightMetric
      ? parseFloat(goalWeight)
      : lbsToKg(parseFloat(goalWeight))

    updateProfile({
      name: name.trim() || '',
      age: parseInt(age, 10),
      gender: sex,
      height,
      weight: weightKg,
      goalWeight: goalKg,
      activityLevel,
      preferences,
    })
    setToastVisible(true)
    setErrors({})
  }, [name, age, sex, isHeightMetric, heightCm, heightFt, heightIn, isWeightMetric, weight, goalWeight, activityLevel, preferences, updateProfile, validate])

  const toggleHeightUnit = useCallback(() => {
    if (isHeightMetric) {
      // Converting cm → ft/in
      const cm = parseInt(heightCm, 10)
      if (!isNaN(cm)) {
        const { feet, inches } = cmToFeetInches(cm)
        setHeightFt(String(feet))
        setHeightIn(String(inches))
      }
    } else {
      // Converting ft/in → cm
      const ft = parseInt(heightFt, 10)
      const inch = parseInt(heightIn, 10)
      if (!isNaN(ft) && !isNaN(inch)) {
        setHeightCm(String(feetInchesToCm(ft, inch)))
      }
    }
    setIsHeightMetric((p) => !p)
  }, [isHeightMetric, heightCm, heightFt, heightIn])

  const toggleWeightUnit = useCallback(() => {
    const w = parseFloat(weight)
    const g = parseFloat(goalWeight)
    if (!isNaN(w)) {
      setWeight(isWeightMetric ? String(kgToLbs(w)) : String(lbsToKg(w)))
    }
    if (!isNaN(g)) {
      setGoalWeight(isWeightMetric ? String(kgToLbs(g)) : String(lbsToKg(g)))
    }
    setIsWeightMetric((p) => !p)
  }, [isWeightMetric, weight, goalWeight])

  const togglePreference = useCallback((tag: string) => {
    setPreferences((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])

  return (
    <PageShell>
      <h1 className="text-headline-md mb-8">Profile</h1>

      <div className="space-y-8 pb-6">
        {/* Personal Info */}
        <section className="space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Personal Info</h2>

          {/* Avatar */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline">person</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-label-sm text-outline mb-1">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all placeholder:text-surface-dim"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-label-sm text-outline mb-1">Age</label>
            <input
              type="number"
              min={10}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 30"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all placeholder:text-surface-dim"
            />
            {errors.age && <p className="text-error text-label-sm mt-1">{errors.age}</p>}
          </div>
        </section>

        {/* Biological Sex */}
        <section className="space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Biological Sex</h2>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((s) => {
              const active = sex === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className={`flex-1 py-4 rounded-xl text-body-lg font-medium transition-all active:scale-95 ${
                    active
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-container-lowest border border-outline-variant text-on-background'
                  }`}
                >
                  {s === 'male' ? 'Male' : 'Female'}
                </button>
              )
            })}
          </div>
        </section>

        {/* Height */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-body-lg font-semibold text-on-background">Height</h2>
            <div className="flex bg-surface-container-lowest rounded-full p-0.5 border border-outline-variant">
              {(['cm', 'ft/in'] as const).map((u) => {
                const isActive = (u === 'cm') === isHeightMetric
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      if ((u === 'cm') !== isHeightMetric) toggleHeightUnit()
                    }}
                    className={`px-3 py-1 rounded-full text-label-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-container text-white'
                        : 'text-outline'
                    }`}
                  >
                    {u}
                  </button>
                )
              })}
            </div>
          </div>
          {isHeightMetric ? (
            <div>
              <input
                type="number"
                min={100}
                max={250}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all placeholder:text-surface-dim"
              />
              <p className="text-label-sm text-outline mt-1">centimeters</p>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min={3}
                    max={8}
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all placeholder:text-surface-dim"
                  />
                  <p className="text-label-sm text-outline mt-1">feet</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="10"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all placeholder:text-surface-dim"
                  />
                  <p className="text-label-sm text-outline mt-1">inches</p>
                </div>
              </div>
            </div>
          )}
          {errors.height && <p className="text-error text-label-sm mt-1">{errors.height}</p>}
        </section>

        {/* Current Weight */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-body-lg font-semibold text-on-background">Current Weight</h2>
            <div className="flex bg-surface-container-lowest rounded-full p-0.5 border border-outline-variant">
              {(['kg', 'lbs'] as const).map((u) => {
                const isActive = (u === 'kg') === isWeightMetric
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      if ((u === 'kg') !== isWeightMetric) toggleWeightUnit()
                    }}
                    className={`px-3 py-1 rounded-full text-label-sm font-medium transition-all ${
                      isActive ? 'bg-primary-container text-white' : 'text-outline'
                    }`}
                  >
                    {u}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <input
              type="number"
              min={isWeightMetric ? 30 : 66}
              max={isWeightMetric ? 300 : 660}
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={isWeightMetric ? 'e.g. 72' : 'e.g. 158'}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all placeholder:text-surface-dim"
            />
            <p className="text-label-sm text-outline mt-1">{currentWeightUnit}</p>
          </div>
          {errors.weight && <p className="text-error text-label-sm mt-1">{errors.weight}</p>}
        </section>

        {/* Goal Weight */}
        <section className="space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Goal Weight</h2>
          <div>
            <input
              type="number"
              min={isWeightMetric ? 30 : 66}
              max={isWeightMetric ? 300 : 660}
              step="0.1"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder={isWeightMetric ? 'e.g. 70' : 'e.g. 154'}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all placeholder:text-surface-dim"
            />
            <p className="text-label-sm text-outline mt-1">{currentWeightUnit}</p>
          </div>
          {errors.goalWeight && <p className="text-error text-label-sm mt-1">{errors.goalWeight}</p>}
        </section>

        {/* Activity Level */}
        <section className="space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Activity Level</h2>
          <div className="space-y-2">
            {activityOptions.map((opt) => {
              const active = activityLevel === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActivityLevel(opt.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-[0.98] ${
                    active
                      ? 'bg-primary-container/10 border-primary-container text-on-primary-container'
                      : 'bg-surface-container-lowest border-outline-variant text-on-background'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    active ? 'border-primary-container' : 'border-outline'
                  }`}>
                    {active && <div className="w-2 h-2 rounded-full bg-primary-container" />}
                  </div>
                  <div className="text-left">
                    <p className="text-body-md font-semibold">{opt.label}</p>
                    <p className="text-label-sm text-outline">{opt.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Dietary Preferences */}
        <section className="space-y-4">
          <h2 className="text-body-lg font-semibold text-on-background">Dietary Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {dietaryTags.map((tag) => {
              const selected = preferences.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => togglePreference(tag)}
                  className={`px-4 py-2 rounded-full text-label-sm font-medium transition-all active:scale-95 cursor-pointer ${
                    selected
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-container-lowest border border-outline-variant text-on-background'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </section>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-primary-container text-white font-semibold h-14 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          Save Profile
        </button>
      </div>

      <Toast
        message="Profile saved"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </PageShell>
  )
}
