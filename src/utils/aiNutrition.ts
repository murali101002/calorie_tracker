interface AiNutritionResponse {
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  source_note: string
}

export async function getAiNutritionEstimate(
  foodName: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<AiNutritionResponse> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'You are a nutrition database assistant. Return ONLY valid JSON, no markdown, no explanation.',
      messages: [
        {
          role: 'user',
          content: `Give approximate nutritional values per 100g for: ${foodName}\nReturn this exact JSON shape:\n{\n  name: string,\n  calories_per_100g: number,\n  protein_per_100g: number,\n  carbs_per_100g: number,\n  fat_per_100g: number,\n  source_note: string (brief note on data source or uncertainty)\n}`,
        },
      ],
    }),
    signal,
  })

  if (!res.ok) throw new Error('AI API error')
  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  return JSON.parse(text.trim())
}

export function aiEstimateToFoodProduct(estimate: AiNutritionResponse): import('../types').FoodProduct {
  return {
    id: crypto.randomUUID(),
    name: estimate.name || 'Unknown Food',
    brand: 'AI Estimate',
    tagline: estimate.source_note || 'Approximate values',
    imageUrl: '',
    servingSize: 100,
    servingUnit: 'gram',
    calories: estimate.calories_per_100g ?? 0,
    protein: estimate.protein_per_100g ?? 0,
    carbs: estimate.carbs_per_100g ?? 0,
    fat: estimate.fat_per_100g ?? 0,
    fiber: 0,
    sodium: 0,
    sugars: 0,
    calcium: '',
    isFavorite: false,
  }
}
