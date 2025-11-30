import type { TournamentLayout, UserPredictions } from "../types.js"

export interface BracketScore {
  totalPoints: number
  correctPredictions: number
  possiblePoints: number
  sectionScores: SectionScore[]
}

export interface SectionScore {
  sectionId: number
  sectionName: string
  points: number
  correctPicks: number
  totalPicks: number
}

/**
 * Calculate points earned from user predictions
 */
export const calculateBracketScore = (layout: TournamentLayout, predictions: UserPredictions): BracketScore => {
  let totalPoints = 0
  let correctPredictions = 0
  let possiblePoints = 0
  const sectionScores: SectionScore[] = []

  for (const section of layout.sections) {
    let sectionPoints = 0
    let sectionCorrect = 0
    let sectionTotal = 0

    for (const group of section.groups) {
      const userPred = predictions.predictions.find((p) => p.groupId === group.groupId)

      if (group.picks && group.picks.length > 0) {
        // Match result is known
        possiblePoints += group.pointsPerPick
        sectionTotal++

        if (userPred) {
          const isCorrect = group.picks.some((pick) => pick.pickIds.includes(userPred.pick))

          if (isCorrect) {
            sectionPoints += group.pointsPerPick
            sectionCorrect++
            correctPredictions++
            totalPoints += group.pointsPerPick
          }
        }
      }
    }

    if (sectionTotal > 0) {
      sectionScores.push({
        sectionId: section.sectionId,
        sectionName: section.name,
        points: sectionPoints,
        correctPicks: sectionCorrect,
        totalPicks: sectionTotal,
      })
    }
  }

  return {
    totalPoints,
    correctPredictions,
    possiblePoints,
    sectionScores,
  }
}

export type CoinTier = "Bronze" | "Silver" | "Gold" | "Diamond"

/**
 * Determine coin tier based on points
 * Thresholds are approximate and may vary per tournament
 */
export const getCoinTier = (points: number): CoinTier => {
  if (points >= 100) return "Diamond"
  if (points >= 75) return "Gold"
  if (points >= 50) return "Silver"
  return "Bronze"
}

/**
 * Get points needed for next tier
 */
export const getPointsToNextTier = (currentPoints: number): { tier: CoinTier; pointsNeeded: number } | null => {
  if (currentPoints >= 100) return null // Already at max tier

  if (currentPoints >= 75) {
    return { tier: "Diamond", pointsNeeded: 100 - currentPoints }
  }
  if (currentPoints >= 50) {
    return { tier: "Gold", pointsNeeded: 75 - currentPoints }
  }
  return { tier: "Silver", pointsNeeded: 50 - currentPoints }
}

/**
 * Calculate prediction accuracy percentage
 */
export const getAccuracyPercentage = (score: BracketScore): number => {
  if (score.possiblePoints === 0) return 0
  return Math.round((score.totalPoints / score.possiblePoints) * 100)
}
