import type { FoodProduct, ServingUnit } from '../types'

interface EdamamNutrients {
  ENERC_KCAL?: number
  PROCNT?: number
  FAT?: number
  CHOCDF?: number
  FIBTG?: number
  SUGAR?: number
  NA?: number
}

interface EdamamMeasure {
  uri?: string
  label?: string
  weight?: number
}

interface EdamamFood {
  foodId: string
  label?: string
  brand?: string
  category?: string
  image?: string
  nutrients?: EdamamNutrients
  servingSizes?: EdamamMeasure[]
}

interface EdamamHint {
  food?: EdamamFood
  measures?: EdamamMeasure[]
}

function mapServingUnit(measure: EdamamMeasure | undefined): ServingUnit {
  const label = (measure?.label || '').toLowerCase()
  if (label.includes('ml') || label.includes('millilit')) return 'ml'
  if (label.includes('fl oz') || label.includes('fluid ounce')) return 'fl_oz'
  if (label.includes('oz') || label.includes('ounce')) return 'ounce'
  if (label.includes('cup')) return 'cup'
  if (label.includes('container') || label.includes('bottle') || label.includes('can')) return 'container'
  return 'gram'
}

export function mapEdamamHint(hint: EdamamHint): FoodProduct {
  const food = hint.food
  const nutrients = food?.nutrients ?? {}
  const measures = hint.measures ?? []
  const primaryMeasure = measures[0]
  const servingWeight = primaryMeasure?.weight ?? 100
  const servingUnit = mapServingUnit(primaryMeasure)

  return {
    id: food?.foodId ?? crypto.randomUUID(),
    name: food?.label || 'Unknown Food',
    brand: food?.brand || '',
    tagline: primaryMeasure ? `${primaryMeasure.label || 'Serving'} (${Math.round(servingWeight)}g)` : '',
    imageUrl: food?.image ?? '',
    servingSize: Math.round(servingWeight),
    servingUnit,
    calories: Math.round(nutrients.ENERC_KCAL ?? 0),
    protein: +(nutrients.PROCNT ?? 0).toFixed(1),
    carbs: +(nutrients.CHOCDF ?? 0).toFixed(1),
    fat: +(nutrients.FAT ?? 0).toFixed(1),
    fiber: +(nutrients.FIBTG ?? 0).toFixed(1),
    sodium: Math.round(nutrients.NA ?? 0),
    sugars: +(nutrients.SUGAR ?? 0).toFixed(1),
    calcium: '',
    isFavorite: false,
  }
}
