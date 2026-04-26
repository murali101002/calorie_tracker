import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Recipe, CategoryType, Ingredient, MacroTotals } from '../types'
import { sampleRecipes } from '../data/sampleRecipes'

function recipeTotals(recipe: Recipe): MacroTotals {
  return recipe.ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fat: acc.fat + ing.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

interface RecipeState {
  recipes: Recipe[]
  selectedCategory: CategoryType

  setCategory: (category: CategoryType) => void
  addRecipe: (recipe: Recipe) => void
  updateRecipe: (id: string, updates: Partial<Recipe>) => void
  removeRecipe: (id: string) => void
  addIngredient: (recipeId: string, ingredient: Ingredient) => void
  removeIngredient: (recipeId: string, ingredientId: string) => void
  getFilteredRecipes: (category: CategoryType, search: string) => Recipe[]
  getRecipeTotals: (recipeId: string) => MacroTotals | null
  seedSampleData: () => void
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      selectedCategory: 'all',

      setCategory: (category) => set({ selectedCategory: category }),

      addRecipe: (recipe) =>
        set((s) => ({ recipes: [...s.recipes, recipe] })),

      updateRecipe: (id, updates) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      removeRecipe: (id) =>
        set((s) => ({
          recipes: s.recipes.filter((r) => r.id !== id),
        })),

      addIngredient: (recipeId, ingredient) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? { ...r, ingredients: [...r.ingredients, ingredient] }
              : r
          ),
        })),

      removeIngredient: (recipeId, ingredientId) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  ingredients: r.ingredients.filter(
                    (i) => i.id !== ingredientId
                  ),
                }
              : r
          ),
        })),

      getFilteredRecipes: (category, search) => {
        let list = get().recipes
        if (category !== 'all') {
          list = list.filter((r) => r.category === category)
        }
        if (search.trim()) {
          const q = search.toLowerCase()
          list = list.filter((r) => r.name.toLowerCase().includes(q))
        }
        return list
      },

      getRecipeTotals: (recipeId) => {
        const recipe = get().recipes.find((r) => r.id === recipeId)
        return recipe ? recipeTotals(recipe) : null
      },

      seedSampleData: () => {
        set({ recipes: sampleRecipes })
      },
    }),
    { name: 'recipe-store' }
  )
)
