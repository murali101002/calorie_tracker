import type { FoodProduct, ServingUnit } from '../types'

interface USDANutrient {
  nutrientId: number
  nutrientName?: string
  value?: number
  unitName?: string
}

interface USDAFoodItem {
  fdcId: number
  description: string
  brandName?: string
  brandOwner?: string
  servingSize?: number
  servingSizeUnit?: string
  householdServingFullText?: string
  foodNutrients?: USDANutrient[]
  foodCategory?: string
  brandedFoodCategory?: string
}

function getNutrient(nutrients: USDANutrient[] | undefined, id: number): number {
  const n = nutrients?.find((n) => n.nutrientId === id)
  return n?.value ?? 0
}

function mapServingUnit(unit: string | undefined): ServingUnit {
  const u = (unit || 'g').toLowerCase()
  if (u.includes('ml')) return 'ml'
  if (u.includes('fl oz')) return 'fl_oz'
  if (u.includes('oz')) return 'ounce'
  if (u.includes('cup')) return 'cup'
  return 'gram'
}

export function mapUSDAFood(item: USDAFoodItem): FoodProduct {
  const nutrients = item.foodNutrients
  const calories = getNutrient(nutrients, 1008)
  const protein = getNutrient(nutrients, 1003)
  const carbs = getNutrient(nutrients, 1005)
  const fat = getNutrient(nutrients, 1004)
  const fiber = getNutrient(nutrients, 1079)
  const sugars = getNutrient(nutrients, 2000)
  const sodium = getNutrient(nutrients, 1093)

  const servingSize = item.servingSize ?? 100
  const servingUnit = mapServingUnit(item.servingSizeUnit)
  const tagline = item.householdServingFullText || item.brandedFoodCategory || item.foodCategory || ''
  const brand = item.brandName || item.brandOwner || ''

  return {
    id: String(item.fdcId),
    name: item.description || 'Unknown Food',
    brand,
    tagline,
    imageUrl: '',
    servingSize,
    servingUnit,
    calories: Math.round(calories),
    protein: +protein.toFixed(1),
    carbs: +carbs.toFixed(1),
    fat: +fat.toFixed(1),
    fiber: +fiber.toFixed(1),
    sodium: Math.round(sodium),
    sugars: +sugars.toFixed(1),
    calcium: '',
    isFavorite: false,
  }
}
