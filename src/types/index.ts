export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'athlete'
export type CategoryType = 'all' | 'high-protein' | 'low-carb' | 'vegan'
export type ServingUnit = 'cup' | 'container' | 'ounce' | 'gram'

export interface DailyLogEntry {
  id: string
  foodId: string
  name: string
  description: string
  icon: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  servingAmount: number
  servingUnit: ServingUnit
  mealType: MealType
  loggedAt: string
}

export interface DailyTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface FoodProduct {
  id: string
  name: string
  brand: string
  tagline: string
  imageUrl: string
  servingSize: number
  servingUnit: ServingUnit
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
  sugars: number
  calcium: string
  isFavorite: boolean
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  imageUrl: string
}

export interface Recipe {
  id: string
  name: string
  category: CategoryType
  prepTime: string
  imageUrl: string
  ingredients: Ingredient[]
  createdAt: string
}

export interface MacroGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface UserProfile {
  name: string
  avatarUrl: string
  height: number
  weight: number
  age: number
  gender: string
  goalWeight: number
  activityLevel: ActivityLevel
}

export interface UserSettings {
  theme: 'light' | 'dark'
  useMetric: boolean
  favoriteProducts: string[]
}
