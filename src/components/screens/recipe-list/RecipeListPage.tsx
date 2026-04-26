import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../layout/PageShell'
import { SearchInput } from '../../shared/SearchInput'
import { ChipGroup } from '../../shared/ChipGroup'
import { RecipeCard } from '../../shared/RecipeCard'
import { useRecipeStore } from '../../../stores/useRecipeStore'
import type { CategoryType } from '../../../types'

const categories: { id: CategoryType; label: string }[] = [
  { id: 'all', label: 'All Recipes' },
  { id: 'high-protein', label: 'High Protein' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'vegan', label: 'Vegan' },
]

export function RecipeListPage() {
  const navigate = useNavigate()
  const selectedCategory = useRecipeStore((s) => s.selectedCategory)
  const setCategory = useRecipeStore((s) => s.setCategory)
  const getFilteredRecipes = useRecipeStore((s) => s.getFilteredRecipes)
  const getRecipeTotals = useRecipeStore((s) => s.getRecipeTotals)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const state = useRecipeStore.getState()
    if (state.recipes.length === 0) {
      state.seedSampleData()
    }
  }, [])

  const filtered = getFilteredRecipes(selectedCategory, searchQuery)

  return (
    <PageShell>
      <div className="space-y-4">
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search healthy recipes..."
          onFilter={() => {}}
        />

        {/* Category Chips */}
        <ChipGroup
          items={categories}
          selectedId={selectedCategory}
          onSelect={(id) => setCategory(id as CategoryType)}
        />

        {/* Recipe List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-md text-outline">
                {searchQuery ? 'No recipes match your search' : 'No recipes yet'}
              </p>
            </div>
          ) : (
            filtered.map((recipe) => {
              const totals = getRecipeTotals(recipe.id) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
              return (
                <RecipeCard
                  key={recipe.id}
                  imageUrl={recipe.imageUrl}
                  name={recipe.name}
                  calories={totals.calories}
                  prepTime={recipe.prepTime}
                  protein={totals.protein}
                  carbs={totals.carbs}
                  fat={totals.fat}
                  onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                />
              )
            })
          )}
        </div>
      </div>
    </PageShell>
  )
}
