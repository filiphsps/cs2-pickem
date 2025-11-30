import { Effect } from "effect";
import type { ApiError, NetworkError } from "../errors.js";
import { HttpClient } from "../http/client.js";
import type { MatchGroup, Pick, Team, TournamentLayout, TournamentSection } from "../types.js";

const GET_LAYOUT_ENDPOINT = "/ICSGOTournaments_730/GetTournamentLayout/v1";

interface RawLayoutResponse {
    result: {
        sections: RawSection[];
    };
}

interface RawSection {
    sectionid: number;
    name: string;
    groups: RawGroup[];
}

interface RawGroup {
    groupid: number;
    name: string;
    points_per_pick: number;
    picks_allowed: boolean;
    picks: RawPick[];
    teams?: RawTeam[];
}

interface RawTeam {
    pickid: number;
    name: string;
}

interface RawPick {
    index: number;
    pickids: number[];
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
                    })
                ),
                picks: group.picks?.map(
                    (pick): Pick => ({
                        index: pick.index,
                        pickIds: pick.pickids,
                    })
                ),
            })
        ),
    }));

    return { sections };
};

/**
 * Fetches the tournament layout for a given event.
 * @param baseUrl The base URL for the API.
 * @param apiKey The Steam API key.
 * @param eventId The ID of the tournament event.
 * @returns An Effect that resolves with the tournament layout.
 * @internal
 */
export const getTournamentLayout = (
    baseUrl: string,
    apiKey: string,
    eventId: number
): Effect.Effect<TournamentLayout, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = `${baseUrl}${GET_LAYOUT_ENDPOINT}`;

        const response = yield* http.get(url, {
            key: apiKey,
            event: String(eventId),
        }) as Effect.Effect<RawLayoutResponse, ApiError | NetworkError>;

        return transformLayout(response);
    });
