// Main client export
export { createPickEmClient } from "./client.js"
export type { PickEmClient } from "./client.js"

// Types
export type {
  ClientConfig,
  UserAuthParams,
  TournamentLayout,
  TournamentSection,
  MatchGroup,
  Team,
  Pick,
  UserPredictions,
  Prediction,
  UploadPredictionParams,
  UploadMultipleParams,
  UploadResult,
  FantasyLineup,
  FantasyTeam,
  UploadLineupParams,
  TournamentItems,
  TournamentItem,
  MarketUrlParams,
} from "./types.js"

// User-facing errors
export {
  PickEmError,
  PickEmValidationError,
  PickEmRateLimitError,
  PickEmPreconditionError,
  PickEmConflictError,
  PickEmGoneError,
} from "./errors.js"

// Utilities
export { buildMarketUrl, getTournamentName, registerTournament } from "./utils/market.js"
export {
  calculateBracketScore,
  getCoinTier,
  getPointsToNextTier,
  getAccuracyPercentage,
} from "./utils/bracket.js"
export type { BracketScore, SectionScore, CoinTier } from "./utils/bracket.js"
export {
  validateSteamId,
  validateAuthCode,
  validateEventId,
  validateUserAuthParams,
  validateUploadPredictionParams,
  validateUploadLineupParams,
} from "./utils/validation.js"
