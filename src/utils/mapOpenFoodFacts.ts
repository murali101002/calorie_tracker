import type { FoodProduct } from '../types'

export function mapOpenFoodFacts(raw: Record<string, unknown>): FoodProduct {
  const p = (raw as Record<string, unknown>) ?? {}
  const nutriments = (p.nutriments as Record<string, number>) ?? {}
  const sugarsVal = nutriments.sugars_100g ?? 0
  const sodiumVal = nutriments.sodium_100g ?? 0
  return {
    id: (p.code as string) ?? crypto.randomUUID(),
    name: (p.product_name as string) || 'Unknown Product',
    brand: (p.brands as string) || '',
    tagline: (p.quantity as string) || '',
    imageUrl: (p.image_url as string) || '',
    servingSize: 100,
    servingUnit: 'gram',
    calories: Math.round((nutriments['energy-kcal_100g'] as number) ?? (nutriments.energy_100g as number) ?? 0),
    protein: (nutriments.proteins_100g as number) ?? 0,
    carbs: (nutriments.carbohydrates_100g as number) ?? 0,
    fat: (nutriments.fat_100g as number) ?? 0,
    fiber: (nutriments.fiber_100g as number) ?? 0,
    sodium: Math.round(sodiumVal),
    sugars: Math.round(sugarsVal * 10) / 10,
    calcium: nutriments.calcium_100g != null ? `${Math.round(nutriments.calcium_100g)}% DV` : '',
    isFavorite: false,
  }
}
