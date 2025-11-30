import { Effect } from "effect"
import { HttpClient } from "../http/client"
import type { ApiError, NetworkError } from "../errors"
import type {
  UserAuthParams,
  UserPredictions,
  UploadPredictionParams,
  UploadMultipleParams,
  UploadResult,
  Prediction,
} from "../types"

const GET_ENDPOINT = "/ICSGOTournaments_730/GetTournamentPredictions/v1"
const UPLOAD_ENDPOINT = "/ICSGOTournaments_730/UploadTournamentPredictions/v1"

interface RawGetResponse {
  result: {
    predictions: RawPrediction[]
  }
}

interface RawPrediction {
  groupid: number
  pick: number
}

interface RawUploadResponse {
  result: UploadResult
}

const transformPredictions = (raw: RawGetResponse): UserPredictions => ({
  predictions: raw.result.predictions.map(
    (p): Prediction => ({
      groupId: p.groupid,
      pick: p.pick,
    }),
  ),
})

export const getPredictions = (
  baseUrl: string,
  apiKey: string,
  params: UserAuthParams,
): Effect.Effect<UserPredictions, ApiError | NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* HttpClient
    const url = `${baseUrl}${GET_ENDPOINT}`

    const response = (yield* http.get(url, {
      key: apiKey,
      event: String(params.eventId),
      steamid: params.steamId,
      steamidkey: params.authCode,
    })) as RawGetResponse

    return transformPredictions(response)
  })

export const uploadPrediction = (
  baseUrl: string,
  apiKey: string,
  params: UploadPredictionParams,
): Effect.Effect<UploadResult, ApiError | NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* HttpClient
    const url = `${baseUrl}${UPLOAD_ENDPOINT}`

    const response = (yield* http.post(url, {
      key: apiKey,
      event: String(params.eventId),
      steamid: params.steamId,
      steamidkey: params.authCode,
      sectionid: String(params.sectionId),
      groupid: String(params.groupId),
      index: String(params.index),
      pickid: String(params.pickId),
      itemid: params.itemId,
    })) as RawUploadResponse

    return response.result
  })

export const uploadMultiplePredictions = (
  baseUrl: string,
  apiKey: string,
  params: UploadMultipleParams,
): Effect.Effect<UploadResult, ApiError | NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* HttpClient
    const url = `${baseUrl}${UPLOAD_ENDPOINT}`

    const body: Record<string, string> = {
      key: apiKey,
      event: String(params.eventId),
      steamid: params.steamId,
      steamidkey: params.authCode,
    }

    params.predictions.forEach((pred, idx) => {
      body[`sectionid${idx}`] = String(pred.sectionId)
      body[`groupid${idx}`] = String(pred.groupId)
      body[`index${idx}`] = String(pred.index)
      body[`pickid${idx}`] = String(pred.pickId)
      body[`itemid${idx}`] = pred.itemId
    })

    const response = (yield* http.post(url, body)) as RawUploadResponse
    return response.result
  })
