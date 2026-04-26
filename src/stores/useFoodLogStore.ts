import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DailyLogEntry, DailyTotals, MealType } from '../types'

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function todayKey(): string {
  return toDateKey(new Date())
}

function sumTotals(entries: DailyLogEntry[]): DailyTotals {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      fiber: acc.fiber + e.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  )
}

interface FoodLogState {
  entries: Record<string, DailyLogEntry[]>
  activeDate: string

  setActiveDate: (date: string) => void
  addEntry: (entry: DailyLogEntry) => void
  removeEntry: (date: string, entryId: string) => void
  updateEntry: (
    date: string,
    entryId: string,
    updates: Partial<DailyLogEntry>
  ) => void
  getEntriesForDate: (date: string) => DailyLogEntry[]
  getEntriesByMeal: (date: string, meal: MealType) => DailyLogEntry[]
  getDailyTotals: (date: string) => DailyTotals
  seedSampleData: () => void
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      entries: {},
      activeDate: todayKey(),

      setActiveDate: (date) => set({ activeDate: date }),

      addEntry: (entry) =>
        set((s) => {
          const dateKey = toDateKey(new Date(entry.loggedAt))
          const existing = s.entries[dateKey] ?? []
          return {
            entries: { ...s.entries, [dateKey]: [...existing, entry] },
          }
        }),

      removeEntry: (date, entryId) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [date]: (s.entries[date] ?? []).filter((e) => e.id !== entryId),
          },
        })),

      updateEntry: (date, entryId, updates) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [date]: (s.entries[date] ?? []).map((e) =>
              e.id === entryId ? { ...e, ...updates } : e
            ),
          },
        })),

      getEntriesForDate: (date) => get().entries[date] ?? [],

      getEntriesByMeal: (date, meal) =>
        (get().entries[date] ?? []).filter((e) => e.mealType === meal),

      getDailyTotals: (date) => sumTotals(get().entries[date] ?? []),

      seedSampleData: () => {
        const today = todayKey()
        const yesterday = toDateKey(new Date(Date.now() - 86400000))
        const now = new Date().toISOString()

        const sample: Record<string, DailyLogEntry[]> = {
          [yesterday]: [
            {
              id: 'y1',
              foodId: 'oatmeal',
              name: 'Oatmeal Bowl',
              description: 'Steel-cut oats, 1 cup',
              icon: 'breakfast_dining',
              calories: 158,
              protein: 6,
              carbs: 27,
              fat: 3.2,
              fiber: 4,
              servingAmount: 1,
              servingUnit: 'cup',
              mealType: 'breakfast',
              loggedAt: yesterday + 'T08:00:00Z',
            },
            {
              id: 'y2',
              foodId: 'chicken-breast',
              name: 'Chicken Breast',
              description: 'Grilled, skinless - 8oz',
              icon: 'restaurant',
              calories: 280,
              protein: 52,
              carbs: 0,
              fat: 6,
              fiber: 0,
              servingAmount: 8,
              servingUnit: 'ounce',
              mealType: 'lunch',
              loggedAt: yesterday + 'T12:30:00Z',
            },
            {
              id: 'y3',
              foodId: 'brown-rice',
              name: 'Brown Rice',
              description: 'Steamed - 1 cup',
              icon: 'grain',
              calories: 216,
              protein: 5,
              carbs: 45,
              fat: 2,
              fiber: 4,
              servingAmount: 1,
              servingUnit: 'cup',
              mealType: 'lunch',
              loggedAt: yesterday + 'T12:31:00Z',
            },
            {
              id: 'y4',
              foodId: 'grilled-salmon-salad',
              name: 'Grilled Salmon Salad',
              description: '350g serving',
              icon: 'restaurant',
              calories: 420,
              protein: 38,
              carbs: 12,
              fat: 24,
              fiber: 5,
              servingAmount: 350,
              servingUnit: 'gram',
              mealType: 'dinner',
              loggedAt: yesterday + 'T19:00:00Z',
            },
          ],
          [today]: [
            {
              id: 't1',
              foodId: 'boiled-eggs',
              name: 'Boiled Eggs',
              description: '2 large eggs',
              icon: 'egg',
              calories: 156,
              protein: 13,
              carbs: 1,
              fat: 11,
              fiber: 0,
              servingAmount: 2,
              servingUnit: 'container',
              mealType: 'breakfast',
              loggedAt: today + 'T07:45:00Z',
            },
            {
              id: 't2',
              foodId: 'avocado-toast',
              name: 'Avocado Toast',
              description: '1 slice, sourdough',
              icon: 'coffee',
              calories: 240,
              protein: 6,
              carbs: 28,
              fat: 14,
              fiber: 8,
              servingAmount: 1,
              servingUnit: 'container',
              mealType: 'breakfast',
              loggedAt: today + 'T07:46:00Z',
            },
            {
              id: 't3',
              foodId: 'grilled-salmon-salad',
              name: 'Grilled Salmon Salad',
              description: '350g serving',
              icon: 'restaurant',
              calories: 420,
              protein: 38,
              carbs: 12,
              fat: 24,
              fiber: 5,
              servingAmount: 350,
              servingUnit: 'gram',
              mealType: 'lunch',
              loggedAt: now,
            },
          ],
        }

        set({
          entries: sample,
          activeDate: today,
        })
      },
    }),
    { name: 'food-log-store' }
  )
)
