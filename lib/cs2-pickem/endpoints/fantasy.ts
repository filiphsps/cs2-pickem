import { Effect } from "effect"
import { HttpClient } from "../http/client"
import type { ApiError, NetworkError } from "../errors"
import type { UserAuthParams, FantasyLineup, UploadLineupParams, UploadResult, FantasyTeam } from "../types"

const GET_ENDPOINT = "/ICSGOTournaments_730/GetTournamentFantasyLineup/v1"
const UPLOAD_ENDPOINT = "/ICSGOTournaments_730/UploadTournamentFantasyLineup/v1"

interface RawGetResponse {
  result: {
    teams: RawFantasyTeam[]
  }
}

interface RawFantasyTeam {
  sectionid: number
  picks: number[]
}

interface RawUploadResponse {
  result: UploadResult
}

const transformLineup = (raw: RawGetResponse): FantasyLineup => ({
  teams: raw.result.teams.map(
    (team): FantasyTeam => ({
      sectionId: team.sectionid,
      picks: team.picks,
    }),
  ),
})

export const getFantasyLineup = (
  baseUrl: string,
  apiKey: string,
  params: UserAuthParams,
): Effect.Effect<FantasyLineup, ApiError | NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* HttpClient
    const url = `${baseUrl}${GET_ENDPOINT}`

    const response = (yield* http.get(url, {
      key: apiKey,
      event: String(params.eventId),
      steamid: params.steamId,
      steamidkey: params.authCode,
    })) as RawGetResponse

    return transformLineup(response)
  })

export const uploadFantasyLineup = (
  baseUrl: string,
  apiKey: string,
  params: UploadLineupParams,
): Effect.Effect<UploadResult, ApiError | NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* HttpClient
    const url = `${baseUrl}${UPLOAD_ENDPOINT}`

    const body: Record<string, string> = {
      key: apiKey,
      event: String(params.eventId),
      steamid: params.steamId,
      steamidkey: params.authCode,
      sectionid: String(params.sectionId),
    }

    params.lineup.forEach((player, idx) => {
      body[`pickid${idx}`] = String(player.pickId)
      body[`itemid${idx}`] = player.itemId
    })

    const response = (yield* http.post(url, body)) as RawUploadResponse
    return response.result
  })
