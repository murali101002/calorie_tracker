import type { FoodProduct, ServingUnit } from '../types'

interface NutritionixItem {
  food_name: string
  serving_unit?: string
  serving_qty?: number
  serving_weight_grams?: number
  nf_calories?: number
  nf_total_fat?: number
  nf_protein?: number
  nf_total_carbohydrate?: number
  nf_dietary_fiber?: number
  nf_sugars?: number
  nf_sodium?: number
  photo?: { thumb?: string }
  brand_name?: string
  tag_id?: string
  nix_item_id?: string
}

function mapServingUnit(unit: string): ServingUnit {
  const u = (unit || '').toLowerCase()
  if (u.includes('ml') || u.includes('millilit')) return 'ml'
  if (u.includes('fl oz') || u.includes('fl. oz') || u.includes('fluid ounce')) return 'fl_oz'
  if (u.includes('oz') || u.includes('ounce')) return 'ounce'
  if (u.includes('cup')) return 'cup'
  if (u.includes('container') || u.includes('bottle') || u.includes('can')) return 'container'
  return 'gram'
}

export function mapNutritionixCommon(item: NutritionixItem): FoodProduct {
  const servingQty = item.serving_qty ?? 1
  const servingWeight = item.serving_weight_grams ?? 100
  const unit = mapServingUnit(item.serving_unit || 'g')

  return {
    id: item.tag_id ?? crypto.randomUUID(),
    name: item.food_name || 'Unknown Food',
    brand: '',
    tagline: `Per ${servingQty} ${item.serving_unit || 'serving'}`,
    imageUrl: item.photo?.thumb ?? '',
    servingSize: servingWeight,
    servingUnit: unit,
    calories: Math.round(item.nf_calories ?? 0),
    protein: +(item.nf_protein ?? 0).toFixed(1),
    carbs: +(item.nf_total_carbohydrate ?? 0).toFixed(1),
    fat: +(item.nf_total_fat ?? 0).toFixed(1),
    fiber: +(item.nf_dietary_fiber ?? 0).toFixed(1),
    sodium: Math.round(item.nf_sodium ?? 0),
    sugars: +(item.nf_sugars ?? 0).toFixed(1),
    calcium: '',
    isFavorite: false,
  }
}

export function mapNutritionixBranded(item: NutritionixItem): FoodProduct {
  const servingQty = item.serving_qty ?? 1
  const servingWeight = item.serving_weight_grams ?? 100
  const unit = mapServingUnit(item.serving_unit || 'g')

  return {
    id: item.nix_item_id ?? crypto.randomUUID(),
    name: item.food_name || 'Unknown Food',
    brand: item.brand_name || '',
    tagline: `Per ${servingQty} ${item.serving_unit || 'serving'}`,
    imageUrl: item.photo?.thumb ?? '',
    servingSize: servingWeight,
    servingUnit: unit,
    calories: Math.round(item.nf_calories ?? 0),
    protein: +(item.nf_protein ?? 0).toFixed(1),
    carbs: +(item.nf_total_carbohydrate ?? 0).toFixed(1),
    fat: +(item.nf_total_fat ?? 0).toFixed(1),
    fiber: +(item.nf_dietary_fiber ?? 0).toFixed(1),
    sodium: Math.round(item.nf_sodium ?? 0),
    sugars: +(item.nf_sugars ?? 0).toFixed(1),
    calcium: '',
    isFavorite: false,
  }
}
