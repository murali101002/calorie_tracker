import { useRef } from 'react'
import { useFoodLogStore } from '../stores/useFoodLogStore'
import { useUserStore } from '../stores/useUserStore'
import type { DailyLogEntry } from '../types'

const EMPTY_ENTRIES: DailyLogEntry[] = []

interface MacroProgress {
  current: number
  goal: number
  pct: number
}

export interface DailyProgress {
  remaining: number
  progress: number
  protein: MacroProgress
  carbs: MacroProgress
  fat: MacroProgress
  statusMessage: string
}

function pct(current: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.min(current / goal, 1)
}

export function useDailyProgress(date: string): DailyProgress {
  // Stable empty array reference prevents selectors returning new [] every store update
  const rawEntries = useFoodLogStore((s) => s.entries[date] ?? EMPTY_ENTRIES)
  const goals = useUserStore((s) => s.goals)

  // Compute totals locally instead of via store method (avoids new object in selector)
  const totalsRef = useRef({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
  const totals = rawEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      fiber: acc.fiber + e.fiber,
    }),
    totalsRef.current
  )

  const remaining = goals.calories - totals.calories
  const progress = pct(totals.calories, goals.calories)

  let statusMessage: string
  if (totals.calories === 0 && totals.protein === 0 && totals.fat === 0 && totals.carbs === 0) {
    statusMessage = 'Start logging your meals'
  } else if (progress < 0.75) {
    statusMessage = 'Plenty of calories remaining'
  } else if (progress <= 1) {
    statusMessage = 'Perfectly on track'
  } else {
    statusMessage = 'Over budget'
  }

  return {
    remaining,
    progress,
    protein: { current: totals.protein, goal: goals.protein, pct: pct(totals.protein, goals.protein) },
    carbs: { current: totals.carbs, goal: goals.carbs, pct: pct(totals.carbs, goals.carbs) },
    fat: { current: totals.fat, goal: goals.fat, pct: pct(totals.fat, goals.fat) },
    statusMessage,
  }
}
