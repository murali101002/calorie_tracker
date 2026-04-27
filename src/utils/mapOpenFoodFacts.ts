import type { FoodProduct, ServingUnit } from '../types'

function parseServingUnit(raw: Record<string, unknown>): ServingUnit {
  const quantity = (raw.quantity as string) || ''
  const servingUnit = (raw.serving_quantity_unit as string) || ''
  const servingSizeStr = (raw.serving_size as string) || ''

  const combined = (quantity + ' ' + servingSizeStr + ' ' + servingUnit).toLowerCase()

  if (combined.includes('ml') || combined.includes('millilit')) return 'ml'
  if (combined.includes('fl oz') || combined.includes('fl. oz') || combined.includes('fluid ounce')) return 'fl_oz'
  if (combined.includes('oz') || combined.includes('ounce')) return 'ounce'
  if (combined.includes('cup')) return 'cup'

  return 'gram'
}

function parseServingAmount(raw: Record<string, unknown>): number {
  // Prefer serving_quantity if available (numeric)
  const sq = raw.serving_quantity as number | undefined
  if (typeof sq === 'number' && sq > 0) return sq

  // Try to extract grams from serving_size string like "2 scoops (102g)" or "51 g"
  const ss = (raw.serving_size as string) || ''
  const match = ss.match(/\(?(\d+\.?\d*)\s*g\)?/i)
  if (match) return parseFloat(match[1])

  return 100
}

export function mapOpenFoodFacts(raw: Record<string, unknown>): FoodProduct {
  const p = (raw as Record<string, unknown>) ?? {}
  const nutriments = (p.nutriments as Record<string, number>) ?? {}
  const sugarsVal = nutriments.sugars_100g ?? 0
  const sodiumVal = nutriments.sodium_100g ?? 0

  const caloriesPer100g = Math.round((nutriments['energy-kcal_100g'] as number) ?? (nutriments.energy_100g as number) ?? 0)
  const proteinPer100g = (nutriments.proteins_100g as number) ?? 0
  const carbsPer100g = (nutriments.carbohydrates_100g as number) ?? 0
  const fatPer100g = (nutriments.fat_100g as number) ?? 0
  const fiberPer100g = (nutriments.fiber_100g as number) ?? 0

  const servingAmount = parseServingAmount(p)
  const scale = servingAmount / 100

  return {
    id: (p.code as string) ?? crypto.randomUUID(),
    name: (p.product_name as string) || 'Unknown Product',
    brand: (p.brands as string) || '',
    tagline: (p.quantity as string) || '',
    imageUrl: (p.image_url as string) || '',
    servingSize: servingAmount,
    servingUnit: parseServingUnit(p),
    calories: Math.round(caloriesPer100g * scale),
    protein: +(proteinPer100g * scale).toFixed(1),
    carbs: +(carbsPer100g * scale).toFixed(1),
    fat: +(fatPer100g * scale).toFixed(1),
    fiber: +(fiberPer100g * scale).toFixed(1),
    sodium: Math.round(sodiumVal),
    sugars: Math.round(sugarsVal * 10) / 10,
    calcium: nutriments.calcium_100g != null ? `${Math.round(nutriments.calcium_100g)}% DV` : '',
    isFavorite: false,
  }
}
