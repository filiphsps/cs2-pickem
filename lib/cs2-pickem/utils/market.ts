import type { MarketUrlParams } from "../types"

const STEAM_MARKET_BASE = "https://steamcommunity.com/market/search"

// Tournament name mappings for market search
const TOURNAMENT_NAMES: Record<number, string> = {
  21: "Paris 2023",
  22: "Copenhagen 2024",
  23: "Shanghai 2024",
  24: "Austin 2025",
  25: "Budapest 2025",
}

/**
 * Build a Steam Community Market URL for sticker search
 */
export const buildMarketUrl = (params: MarketUrlParams): string => {
  const tournamentName = TOURNAMENT_NAMES[params.tournamentId] ?? `Tournament ${params.tournamentId}`

  const searchParams = new URLSearchParams({
    appid: "730",
    category_730_Type: "tag_CSGO_Type_Sticker",
  })

  if (params.type === "team" && params.teamId) {
    searchParams.set("q", `${tournamentName}`)
  } else if (params.type === "player" && params.playerTag) {
    searchParams.set("q", `${params.playerTag} ${tournamentName}`)
  }

  return `${STEAM_MARKET_BASE}?${searchParams.toString()}`
}

/**
 * Get tournament display name
 */
export const getTournamentName = (tournamentId: number): string => {
  return TOURNAMENT_NAMES[tournamentId] ?? `Tournament ${tournamentId}`
}

/**
 * Add or update tournament name mapping
 */
export const registerTournament = (tournamentId: number, name: string): void => {
  TOURNAMENT_NAMES[tournamentId] = name
}
