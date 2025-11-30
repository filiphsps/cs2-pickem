// Main client export
export { createPickEmClient } from "./client"
export type { PickEmClient } from "./client"

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
} from "./types"

// User-facing errors
export {
  PickEmError,
  PickEmValidationError,
  PickEmRateLimitError,
  PickEmPreconditionError,
  PickEmConflictError,
  PickEmGoneError,
} from "./errors"

// Utilities
export { buildMarketUrl, getTournamentName, registerTournament } from "./utils/market"
export {
  calculateBracketScore,
  getCoinTier,
  getPointsToNextTier,
  getAccuracyPercentage,
} from "./utils/bracket"
export type { BracketScore, SectionScore, CoinTier } from "./utils/bracket"
export {
  validateSteamId,
  validateAuthCode,
  validateEventId,
  validateUserAuthParams,
  validateUploadPredictionParams,
  validateUploadLineupParams,
} from "./utils/validation"
