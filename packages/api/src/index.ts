// Main client export

export type { PickEmClient } from "./client.js";
export { createPickEmClient, enrichLayout } from "./client.js";
// User-facing errors
export {
    PickEmConflictError,
    PickEmError,
    PickEmGoneError,
    PickEmPreconditionError,
    PickEmRateLimitError,
    PickEmValidationError,
} from "./errors.js";
// Types
export type {
    ClientConfig,
    FantasyLineup,
    FantasyTeam,
    MarketUrlParams,
    MatchGroup,
    Pick,
    Prediction,
    Team,
    TournamentItem,
    TournamentItems,
    TournamentLayout,
    TournamentSection,
    UploadLineupParams,
    UploadMultipleParams,
    UploadPredictionParams,
    UploadResult,
    UserAuthParams,
    UserPredictions,
} from "./types.js";
export type { BracketScore, CoinTier, SectionScore } from "./utils/bracket.js";
export {
    calculateBracketScore,
    getAccuracyPercentage,
    getCoinTier,
    getPointsToNextTier,
} from "./utils/bracket.js";
export { buildMarketUrl, getTournamentName, registerTournament } from "./utils/market.js";
// Utilities
export { teamNameMap } from "./utils/teams.js";
export {
    validateAuthCode,
    validateEventId,
    validateSteamId,
    validateUploadLineupParams,
    validateUploadPredictionParams,
    validateUserAuthParams,
} from "./utils/validation.js";
