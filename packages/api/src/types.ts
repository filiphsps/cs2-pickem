// ===== Common Types =====
export interface UserAuthParams {
  eventId: number
  steamId: string
  authCode: string
}

// ===== Tournament Types =====
export interface TournamentLayout {
  sections: TournamentSection[]
}

export interface TournamentSection {
  sectionId: number
  name: string
  groups: MatchGroup[]
}

export interface MatchGroup {
  groupId: number
  name: string
  pointsPerPick: number
  picksAllowed: boolean
  teams: Team[]
  picks?: Pick[]
}

export interface Team {
  pickId: number
  name: string
}

export interface Pick {
  index: number
  pickIds: number[]
}

// ===== Prediction Types =====
export interface UserPredictions {
  predictions: Prediction[]
}

export interface Prediction {
  groupId: number
  pick: number
}

export interface UploadPredictionParams extends UserAuthParams {
  sectionId: number
  groupId: number
  index: number
  pickId: number
  itemId: string
}

export interface UploadMultipleParams extends UserAuthParams {
  predictions: Array<{
    sectionId: number
    groupId: number
    index: number
    pickId: number
    itemId: string
  }>
}

// ===== Fantasy Types =====
export interface FantasyLineup {
  teams: FantasyTeam[]
}

export interface FantasyTeam {
  sectionId: number
  picks: number[] // 5 player schema IDs
}

export interface UploadLineupParams extends UserAuthParams {
  sectionId: number
  lineup: Array<{
    pickId: number
    itemId: string
  }>
}

// ===== Items Types =====
export interface TournamentItems {
  items: TournamentItem[]
}

export interface TournamentItem {
  itemId: string
  type: "team" | "player"
  teamId?: number
  playerId?: number
}

// ===== Upload Result =====
export interface UploadResult {
  itemId?: string
  itemId0?: string
  itemId1?: string
  itemId2?: string
  itemId3?: string
  itemId4?: string
}

// ===== Market URL Params =====
export interface MarketUrlParams {
  type: "team" | "player"
  teamId?: number
  playerTag?: string
  tournamentId: number
}

// ===== Configuration =====
export interface ClientConfig {
  apiKey: string
  baseUrl?: string
}
