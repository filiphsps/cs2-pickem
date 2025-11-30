import { describe, it, expect } from "vitest"
import { calculateBracketScore, getCoinTier, getPointsToNextTier, getAccuracyPercentage } from "./bracket.js"
import type { TournamentLayout, UserPredictions } from "../types.js"

describe("calculateBracketScore", () => {
  const mockLayout: TournamentLayout = {
    sections: [
      {
        sectionId: 1,
        name: "Challengers Stage",
        groups: [
          {
            groupId: 101,
            name: "Match 1",
            pointsPerPick: 1,
            picksAllowed: false,
            teams: [
              { pickId: 1, name: "Team A" },
              { pickId: 2, name: "Team B" },
            ],
            picks: [{ index: 0, pickIds: [1] }], // Team A won
          },
          {
            groupId: 102,
            name: "Match 2",
            pointsPerPick: 1,
            picksAllowed: false,
            teams: [
              { pickId: 3, name: "Team C" },
              { pickId: 4, name: "Team D" },
            ],
            picks: [{ index: 0, pickIds: [4] }], // Team D won
          },
        ],
      },
      {
        sectionId: 2,
        name: "Legends Stage",
        groups: [
          {
            groupId: 201,
            name: "Match 3",
            pointsPerPick: 2,
            picksAllowed: false,
            teams: [
              { pickId: 1, name: "Team A" },
              { pickId: 4, name: "Team D" },
            ],
            picks: [{ index: 0, pickIds: [1] }], // Team A won
          },
        ],
      },
    ],
  }

  it("should calculate score for correct predictions", () => {
    const predictions: UserPredictions = {
      predictions: [
        { groupId: 101, pick: 1 }, // Correct
        { groupId: 102, pick: 4 }, // Correct
        { groupId: 201, pick: 1 }, // Correct
      ],
    }

    const score = calculateBracketScore(mockLayout, predictions)

    expect(score.totalPoints).toBe(4) // 1 + 1 + 2
    expect(score.correctPredictions).toBe(3)
    expect(score.possiblePoints).toBe(4)
    expect(score.sectionScores).toHaveLength(2)
    expect(score.sectionScores[0]?.points).toBe(2) // Challengers
    expect(score.sectionScores[1]?.points).toBe(2) // Legends
  })

  it("should calculate score for incorrect predictions", () => {
    const predictions: UserPredictions = {
      predictions: [
        { groupId: 101, pick: 2 }, // Wrong
        { groupId: 102, pick: 3 }, // Wrong
        { groupId: 201, pick: 4 }, // Wrong
      ],
    }

    const score = calculateBracketScore(mockLayout, predictions)

    expect(score.totalPoints).toBe(0)
    expect(score.correctPredictions).toBe(0)
    expect(score.possiblePoints).toBe(4)
  })

  it("should handle missing predictions", () => {
    const predictions: UserPredictions = {
      predictions: [{ groupId: 101, pick: 1 }], // Only one prediction
    }

    const score = calculateBracketScore(mockLayout, predictions)

    expect(score.totalPoints).toBe(1)
    expect(score.correctPredictions).toBe(1)
    expect(score.possiblePoints).toBe(4)
  })

  it("should handle empty predictions", () => {
    const predictions: UserPredictions = {
      predictions: [],
    }

    const score = calculateBracketScore(mockLayout, predictions)

    expect(score.totalPoints).toBe(0)
    expect(score.correctPredictions).toBe(0)
  })
})

describe("getCoinTier", () => {
  it("should return Diamond for 100+ points", () => {
    expect(getCoinTier(100)).toBe("Diamond")
    expect(getCoinTier(150)).toBe("Diamond")
  })

  it("should return Gold for 75-99 points", () => {
    expect(getCoinTier(75)).toBe("Gold")
    expect(getCoinTier(99)).toBe("Gold")
  })

  it("should return Silver for 50-74 points", () => {
    expect(getCoinTier(50)).toBe("Silver")
    expect(getCoinTier(74)).toBe("Silver")
  })

  it("should return Bronze for less than 50 points", () => {
    expect(getCoinTier(0)).toBe("Bronze")
    expect(getCoinTier(49)).toBe("Bronze")
  })
})

describe("getPointsToNextTier", () => {
  it("should return null when at Diamond tier", () => {
    expect(getPointsToNextTier(100)).toBeNull()
    expect(getPointsToNextTier(150)).toBeNull()
  })

  it("should calculate points to Diamond from Gold", () => {
    const result = getPointsToNextTier(75)
    expect(result?.tier).toBe("Diamond")
    expect(result?.pointsNeeded).toBe(25)
  })

  it("should calculate points to Gold from Silver", () => {
    const result = getPointsToNextTier(50)
    expect(result?.tier).toBe("Gold")
    expect(result?.pointsNeeded).toBe(25)
  })

  it("should calculate points to Silver from Bronze", () => {
    const result = getPointsToNextTier(30)
    expect(result?.tier).toBe("Silver")
    expect(result?.pointsNeeded).toBe(20)
  })
})

describe("getAccuracyPercentage", () => {
  it("should calculate correct percentage", () => {
    expect(
      getAccuracyPercentage({
        totalPoints: 75,
        correctPredictions: 15,
        possiblePoints: 100,
        sectionScores: [],
      }),
    ).toBe(75)
  })

  it("should return 0 for empty tournament", () => {
    expect(
      getAccuracyPercentage({
        totalPoints: 0,
        correctPredictions: 0,
        possiblePoints: 0,
        sectionScores: [],
      }),
    ).toBe(0)
  })

  it("should round to nearest integer", () => {
    expect(
      getAccuracyPercentage({
        totalPoints: 1,
        correctPredictions: 1,
        possiblePoints: 3,
        sectionScores: [],
      }),
    ).toBe(33)
  })
})
