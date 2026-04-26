import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../../layout/PageShell'
import { IngredientCard } from '../../shared/IngredientCard'
import { useRecipeStore } from '../../../stores/useRecipeStore'
import { sampleFoods } from '../../../data/sampleFoods'
import type { Ingredient } from '../../../types'

function generateId(): string {
  return crypto.randomUUID()
}

export function RecipeBuilderPage() {
  const { recipeId } = useParams<{ recipeId: string }>()
  const navigate = useNavigate()
  const recipes = useRecipeStore((s) => s.recipes)
  const addRecipe = useRecipeStore((s) => s.addRecipe)
  const updateRecipe = useRecipeStore((s) => s.updateRecipe)
  const removeIngredient = useRecipeStore((s) => s.removeIngredient)

  const existing = recipeId ? recipes.find((r) => r.id === recipeId) : null
  const isEditing = !!existing

  const [name, setName] = useState(existing?.name ?? '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(existing?.ingredients ?? [])
  const [recipeSavedId] = useState<string | null>(existing?.id ?? null)

  // Sync when editing
  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setIngredients(existing.ingredients)
    }
  }, [recipeId])

  // Auto-init demo recipe for new
  useEffect(() => {
    if (!isEditing && ingredients.length === 0) {
      setName('Garden Pesto Pasta')
      setIngredients([
        {
          id: generateId(), name: 'Whole Wheat Pasta', amount: 100, unit: 'g',
          calories: 350, protein: 12, carbs: 70, fat: 2,
          imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=100&h=100&fit=crop',
        },
        {
          id: generateId(), name: 'Basil Pesto', amount: 30, unit: 'g',
          calories: 120, protein: 3, carbs: 3, fat: 12,
          imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bf2477cda34?w=100&h=100&fit=crop',
        },
        {
          id: generateId(), name: 'Cherry Tomatoes', amount: 50, unit: 'g',
          calories: 15, protein: 0.5, carbs: 3, fat: 0.1,
          imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0ec9d71f1?w=100&h=100&fit=crop',
        },
      ])
    }
  }, [])

  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fat: acc.fat + ing.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const handleAddIngredient = useCallback(() => {
    const food = sampleFoods[Math.floor(Math.random() * sampleFoods.length)]
    setIngredients((prev) => [
      ...prev,
      {
        id: generateId(), name: food.name, amount: food.servingSize,
        unit: String(food.servingUnit), calories: food.calories,
        protein: food.protein, carbs: food.carbs, fat: food.fat,
        imageUrl: food.imageUrl,
      },
    ])
  }, [])

  const handleRemove = useCallback((ingredientId: string) => {
    if (recipeSavedId && isEditing) {
      removeIngredient(recipeSavedId, ingredientId)
    }
    setIngredients((prev) => prev.filter((i) => i.id !== ingredientId))
  }, [recipeSavedId, isEditing, removeIngredient])

  const handleSave = useCallback(() => {
    if (!name.trim()) return
    const recipe = {
      id: recipeSavedId ?? generateId(),
      name: name.trim(),
      category: 'all' as const,
      prepTime: '20 min',
      imageUrl: ingredients[0]?.imageUrl ?? '',
      ingredients,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }
    if (isEditing) {
      updateRecipe(recipe.id, recipe)
    } else {
      addRecipe(recipe)
    }
    navigate('/recipes')
  }, [name, ingredients, recipeSavedId, isEditing, existing, addRecipe, updateRecipe, navigate])

  return (
    <PageShell>
      <div className="pt-6 space-y-8">
        {/* Recipe Name */}
        <div>
          <label className="block text-label-sm text-outline mb-1">Recipe Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter recipe name..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4
              text-headline-md focus:outline-none focus:ring-2 focus:ring-primary-container
              focus:border-transparent transition-all placeholder:text-surface-dim"
          />
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-body-lg font-bold">Ingredients</h2>
            <span className="text-label-sm text-outline">{ingredients.length} items</span>
          </div>

          <div className="space-y-4">
            {ingredients.map((ing) => (
              <IngredientCard
                key={ing.id}
                imageUrl={ing.imageUrl}
                name={ing.name}
                amount={`${ing.amount}${ing.unit}`}
                calories={ing.calories}
                onRemove={() => handleRemove(ing.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddIngredient}
            className="w-full py-4 border-2 border-dashed border-outline-variant rounded-xl
              flex items-center justify-center gap-2 text-outline
              hover:text-primary-container hover:border-primary-container transition-all
              active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="text-label-lg">+ Add Ingredient</span>
          </button>
        </div>

        {/* Totals Card */}
        {ingredients.length > 0 && (
          <div className="bg-primary-container/10 border border-primary-container/20 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-label-sm text-primary/70 uppercase">Total Calories</h3>
                <p className="text-headline-lg text-primary">{totals.calories} kcal</p>
              </div>
              <div className="bg-primary-container text-white px-3 py-1 rounded-full text-label-sm">
                Per Serving
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-container/10">
              <div className="text-center">
                <p className="text-label-sm text-primary/60">Protein</p>
                <p className="text-body-lg font-bold text-primary">{totals.protein}g</p>
                <div className="w-full bg-white/50 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-label-sm text-primary/60">Carbs</p>
                <p className="text-body-lg font-bold text-primary">{totals.carbs}g</p>
                <div className="w-full bg-white/50 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-label-sm text-primary/60">Fat</p>
                <p className="text-body-lg font-bold text-primary">{totals.fat}g</p>
                <div className="w-full bg-white/50 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full bg-primary-container text-white font-semibold text-body-lg py-4 rounded-full
            shadow-lg active:scale-95 transition-all cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Recipe
        </button>
      </div>
    </PageShell>
  )
}
