import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, MacroGoals, UserSettings } from '../types'

interface UserState {
  profile: UserProfile
  goals: MacroGoals
  settings: UserSettings

  updateProfile: (updates: Partial<UserProfile>) => void
  updateGoals: (updates: Partial<MacroGoals>) => void
  updateSettings: (updates: Partial<UserSettings>) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Alex Chen',
        avatarUrl: '',
        height: 175,
        weight: 72,
        age: 30,
        gender: 'male',
      },
      goals: {
        calories: 2200,
        protein: 120,
        carbs: 250,
        fat: 65,
        fiber: 25,
      },
      settings: {
        theme: 'light',
        useMetric: true,
        favoriteProducts: [],
      },

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),
      updateGoals: (updates) =>
        set((s) => ({ goals: { ...s.goals, ...updates } })),
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),
    }),
    { name: 'user-store' }
  )
)
