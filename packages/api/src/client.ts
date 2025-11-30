import { Effect, Layer } from "effect"
import { HttpClient, makeHttpClient } from "./http/client.js"
import * as Tournament from "./endpoints/tournament.js"
import * as Predictions from "./endpoints/predictions.js"
import * as Fantasy from "./endpoints/fantasy.js"
import * as Items from "./endpoints/items.js"
import { buildMarketUrl } from "./utils/market.js"
import { convertError } from "./errors.js"
import type {
  ClientConfig,
  TournamentLayout,
  UserAuthParams,
  UserPredictions,
  UploadPredictionParams,
  UploadMultipleParams,
  UploadResult,
  TournamentItems,
  FantasyLineup,
  UploadLineupParams,
  MarketUrlParams,
} from "./types.js"

// ===== Main Client Interface =====
export interface PickEmClient {
  // Core prediction methods
  getTournamentLayout(eventId: number): Promise<TournamentLayout>
  getPredictions(params: UserAuthParams): Promise<UserPredictions>
  uploadPrediction(params: UploadPredictionParams): Promise<UploadResult>
  uploadMultiplePredictions(params: UploadMultipleParams): Promise<UploadResult>
  getTournamentItems(params: UserAuthParams): Promise<TournamentItems>

  // Fantasy methods (optional)
  getFantasyLineup(params: UserAuthParams): Promise<FantasyLineup>
  uploadFantasyLineup(params: UploadLineupParams): Promise<UploadResult>

  // Utility methods
  getMarketUrl(params: MarketUrlParams): string
}

const DEFAULT_BASE_URL = "https://api.steampowered.com"

// Convert Effect to Promise with error mapping
const toPromise = <A, E>(effect: Effect.Effect<A, E, HttpClient>): Promise<A> => {
  const httpLayer = Layer.succeed(HttpClient, makeHttpClient())
  const provided = Effect.provide(effect, httpLayer)

  return Effect.runPromise(provided).catch((error) => {
    throw convertError(error)
  })
}

// ===== Client Factory =====
export const createPickEmClient = (config: ClientConfig): PickEmClient => {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
  const { apiKey } = config

  return {
    getTournamentLayout: (eventId) => toPromise(Tournament.getTournamentLayout(baseUrl, apiKey, eventId)),

    getPredictions: (params) => toPromise(Predictions.getPredictions(baseUrl, apiKey, params)),

    uploadPrediction: (params) => toPromise(Predictions.uploadPrediction(baseUrl, apiKey, params)),

    uploadMultiplePredictions: (params) => toPromise(Predictions.uploadMultiplePredictions(baseUrl, apiKey, params)),

    getTournamentItems: (params) => toPromise(Items.getTournamentItems(baseUrl, apiKey, params)),

    getFantasyLineup: (params) => toPromise(Fantasy.getFantasyLineup(baseUrl, apiKey, params)),

    uploadFantasyLineup: (params) => toPromise(Fantasy.uploadFantasyLineup(baseUrl, apiKey, params)),

    getMarketUrl: (params) => buildMarketUrl(params),
  }
}
