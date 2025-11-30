import { Effect } from "effect";
import type { ApiError, NetworkError } from "../errors.js";
import { HttpClient } from "../http/client.js";
import type { TournamentItem, TournamentItems, UserAuthParams } from "../types.js";

const GET_ENDPOINT = "/ICSGOTournaments_730/GetTournamentItems/v1";

interface RawGetResponse {
    result: {
        items: RawItem[];
    };
}

interface RawItem {
    itemid: string;
    type: "team" | "player";
    teamid?: number;
    playerid?: number;
}

const transformItems = (raw: RawGetResponse): TournamentItems => {
    return {
        items: raw.result.items.map(
            (item): TournamentItem => ({
                itemId: item.itemid,
                type: item.type,
                teamId: item.teamid,
                playerId: item.playerid,
            })
        ),
    };
};

/**
 * Fetches the tournament items for a given event.
 * @param baseUrl The base URL for the API.
 * @param apiKey The Steam API key.
 * @param params The user authentication parameters.
 * @returns An Effect that resolves with the tournament items.
 * @internal
 */
export const getTournamentItems = (
    baseUrl: string,
    apiKey: string,
    params: UserAuthParams
): Effect.Effect<TournamentItems, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = `${baseUrl}${GET_ENDPOINT}`;

        const response = yield* http.get(url, {
            key: apiKey,
            event: String(params.eventId),
            steamid: params.steamId,
            steamidkey: params.authCode,
        }) as Effect.Effect<RawGetResponse, ApiError | NetworkError>;

        return transformItems(response);
    }).pipe(
        Effect.catchTags({
            ApiError: () => Effect.succeed({ items: [] }),
        })
    );
