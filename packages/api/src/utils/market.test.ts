import { describe, it, expect } from "vitest"
import { buildMarketUrl, getTournamentName, registerTournament } from "./market.js"

describe("buildMarketUrl", () => {
  it("should build URL for team sticker", () => {
    const url = buildMarketUrl({
      type: "team",
      teamId: 57,
      tournamentId: 25,
    })

    expect(url).toContain("steamcommunity.com/market/search")
    expect(url).toContain("appid=730")
    expect(url).toContain("category_730_Type=tag_CSGO_Type_Sticker")
    expect(url).toContain("Budapest+2025")
  })

  it("should build URL for player sticker", () => {
    const url = buildMarketUrl({
      type: "player",
      playerTag: "s1mple",
      tournamentId: 25,
    })

    expect(url).toContain("s1mple")
    expect(url).toContain("Budapest+2025")
  })

  it("should handle unknown tournament ID", () => {
    const url = buildMarketUrl({
      type: "team",
      teamId: 1,
      tournamentId: 999,
    })

    expect(url).toContain("Tournament+999")
  })
})

describe("getTournamentName", () => {
  it("should return known tournament names", () => {
    expect(getTournamentName(25)).toBe("Budapest 2025")
    expect(getTournamentName(24)).toBe("Austin 2025")
    expect(getTournamentName(22)).toBe("Copenhagen 2024")
  })

  it("should return fallback for unknown tournaments", () => {
    expect(getTournamentName(999)).toBe("Tournament 999")
  })
})

describe("registerTournament", () => {
  it("should register new tournament name", () => {
    registerTournament(100, "Test Tournament 2026")
    expect(getTournamentName(100)).toBe("Test Tournament 2026")
  })

  it("should override existing tournament name", () => {
    registerTournament(25, "New Budapest Name")
    expect(getTournamentName(25)).toBe("New Budapest Name")
    // Reset for other tests
    registerTournament(25, "Budapest 2025")
  })
})
