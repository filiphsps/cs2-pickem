import { Effect } from "effect"
import { HttpClient } from "../http/client.js"
import type { ApiError, NetworkError } from "../errors.js"
import type { TournamentLayout, TournamentSection, MatchGroup, Team, Pick } from "../types.js"

const GET_LAYOUT_ENDPOINT = "/ICSGOTournaments_730/GetTournamentLayout/v1"

interface RawLayoutResponse {
  result: {
    sections: RawSection[]
  }
}

interface RawSection {
  sectionid: number
  name: string
  groups: RawGroup[]
}

interface RawGroup {
  groupid: number
  name: string
  points_per_pick: number
  picks_allowed: boolean
  picks: RawPick[]
  teams?: RawTeam[]
}

interface RawTeam {
  pickid: number
  name: string
}

interface RawPick {
  index: number
  pickids: number[]
}

const transformLayout = (raw: RawLayoutResponse): TournamentLayout => {
  const sections: TournamentSection[] = raw.result.sections.map((section) => ({
    sectionId: section.sectionid,
    name: section.name,
    groups: section.groups.map(
      (group): MatchGroup => ({
        groupId: group.groupid,
        name: group.name,
        pointsPerPick: group.points_per_pick,
        picksAllowed: group.picks_allowed,
        teams: (group.teams ?? []).map(
          (team): Team => ({
            pickId: team.pickid,
            name: team.name,
          }),
        ),
        picks: group.picks?.map(
          (pick): Pick => ({
            index: pick.index,
            pickIds: pick.pickids,
          }),
        ),
      }),
    ),
  }))

  return { sections }
}

export const getTournamentLayout = (
  baseUrl: string,
  apiKey: string,
  eventId: number,
): Effect.Effect<TournamentLayout, ApiError | NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* HttpClient
    const url = `${baseUrl}${GET_LAYOUT_ENDPOINT}`

    const response = yield* http.get(url, {
      key: apiKey,
      event: String(eventId),
    }) as Effect.Effect<RawLayoutResponse, ApiError | NetworkError>

    return transformLayout(response)
  })
