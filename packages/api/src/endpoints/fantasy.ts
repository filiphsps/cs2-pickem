import { Effect } from "effect";
import type { ApiError, NetworkError } from "../errors.js";
import { HttpClient } from "../http/client.js";
import type {
    FantasyLineup,
    FantasyTeam,
    UploadLineupParams,
    UploadResult,
    UserAuthParams,
} from "../types.js";

const GET_ENDPOINT = "/ICSGOTournaments_730/GetTournamentFantasyLineup/v1";
const UPLOAD_ENDPOINT = "/ICSGOTournaments_730/UploadTournamentFantasyLineup/v1";

interface RawGetResponse {
    result: {
        teams: RawFantasyTeam[];
    };
}

interface RawFantasyTeam {
    sectionid: number;
    picks: number[];
}

interface RawUploadResponse {
    result: UploadResult;
}

const transformLineup = (raw: RawGetResponse): FantasyLineup => ({
    teams: raw.result.teams.map(
        (team): FantasyTeam => ({
            sectionId: team.sectionid,
            picks: team.picks,
        })
    ),
});

/**
 * Fetches the user's fantasy lineup for a given tournament.
 * @param baseUrl The base URL for the API.
 * @param apiKey The Steam API key.
 * @param params The user authentication parameters.
 * @returns An Effect that resolves with the user's fantasy lineup.
 * @internal
 */
export const getFantasyLineup = (
    baseUrl: string,
    apiKey: string,
    params: UserAuthParams
): Effect.Effect<FantasyLineup, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = `${baseUrl}${GET_ENDPOINT}`;

        const response = yield* http.get(url, {
            key: apiKey,
            event: String(params.eventId),
            steamid: params.steamId,
            steamidkey: params.authCode,
        }) as Effect.Effect<RawGetResponse, ApiError | NetworkError>;

        return transformLineup(response);
    });

/**
 * Uploads the user's fantasy lineup for a given tournament.
 * @param baseUrl The base URL for the API.
 * @param apiKey The Steam API key.
 * @param params The parameters for the fantasy lineup to upload.
 * @returns An Effect that resolves with the result of the upload.
 * @internal
 */
export const uploadFantasyLineup = (
    baseUrl: string,
    apiKey: string,
    params: UploadLineupParams
): Effect.Effect<UploadResult, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = `${baseUrl}${UPLOAD_ENDPOINT}`;

        // Build body with player positions
        const body: Record<string, string> = {
            key: apiKey,
            event: String(params.eventId),
            steamid: params.steamId,
            steamidkey: params.authCode,
            sectionid: String(params.sectionId),
        };

        // Add 5 player picks
        params.lineup.forEach((player, idx) => {
            body[`pickid${idx}`] = String(player.pickId);
            body[`itemid${idx}`] = player.itemId;
        });

        const response = yield* http.post(url, body) as Effect.Effect<
            RawUploadResponse,
            ApiError | NetworkError
        >;
        return response.result;
    });
