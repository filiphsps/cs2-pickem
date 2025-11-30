import { Effect } from "effect";
import type { ApiError, NetworkError } from "../errors.js";
import { HttpClient } from "../http/client.js";
import type {
    Prediction,
    UploadMultipleParams,
    UploadPredictionParams,
    UploadResult,
    UserAuthParams,
    UserPredictions,
} from "../types.js";

const GET_ENDPOINT = "/ICSGOTournaments_730/GetTournamentPredictions/v1";
const UPLOAD_ENDPOINT = "/ICSGOTournaments_730/UploadTournamentPredictions/v1";

interface RawGetResponse {
    result:
        | {
              predictions: RawPrediction[];
          }
        | {
              picks: RawPrediction[];
          };
}

interface RawPrediction {
    groupid: number;
    pick: number;
}

interface RawUploadResponse {
    result: UploadResult;
}

const transformPredictions = (raw: RawGetResponse): UserPredictions => {
    // Type guard: check which property exists
    const picks = "predictions" in raw.result ? raw.result.predictions : raw.result.picks;

    return {
        predictions: picks.map(
            (p): Prediction => ({
                groupId: p.groupid,
                pick: p.pick,
            })
        ),
    };
};

/**
 * Fetches the user's predictions for a given tournament.
 * @param baseUrl The base URL for the API.
 * @param apiKey The Steam API key.
 * @param params The user authentication parameters.
 * @returns An Effect that resolves with the user's predictions.
 * @internal
 */
export const getPredictions = (
    baseUrl: string,
    apiKey: string,
    params: UserAuthParams
): Effect.Effect<UserPredictions, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = `${baseUrl}${GET_ENDPOINT}`;

        const response = yield* http.get(url, {
            key: apiKey,
            event: String(params.eventId),
            steamid: params.steamId,
            steamidkey: params.authCode,
        }) as Effect.Effect<RawGetResponse, ApiError | NetworkError>;

        return transformPredictions(response);
    });

/**
 * Uploads a single prediction for the user.
 * @param baseUrl The base URL for the API.
 * @param apiKey The Steam API key.
 * @param params The parameters for the prediction to upload.
 * @returns An Effect that resolves with the result of the upload.
 * @internal
 */
export const uploadPrediction = (
    baseUrl: string,
    apiKey: string,
    params: UploadPredictionParams
): Effect.Effect<UploadResult, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = `${baseUrl}${UPLOAD_ENDPOINT}`;

        const response = yield* http.post(url, {
            key: apiKey,
            event: String(params.eventId),
            steamid: params.steamId,
            steamidkey: params.authCode,
            sectionid: String(params.sectionId),
            groupid: String(params.groupId),
            index: String(params.index),
            pickid: String(params.pickId),
            itemid: params.itemId,
        }) as Effect.Effect<RawUploadResponse, ApiError | NetworkError>;

        return response.result;
    });

/**
 * Uploads multiple predictions for the user.
 * @param baseUrl The base URL for the API.
 * @param apiKey The Steam API key.
 * @param params The parameters for the predictions to upload.
 * @returns An Effect that resolves with the result of the upload.
 * @internal
 */
export const uploadMultiplePredictions = (
    baseUrl: string,
    apiKey: string,
    params: UploadMultipleParams
): Effect.Effect<UploadResult, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = `${baseUrl}${UPLOAD_ENDPOINT}`;

        // Build body with numbered parameters for multiple predictions
        const body: Record<string, string> = {
            key: apiKey,
            event: String(params.eventId),
            steamid: params.steamId,
            steamidkey: params.authCode,
        };

        params.predictions.forEach((pred, idx) => {
            body[`sectionid${idx}`] = String(pred.sectionId);
            body[`groupid${idx}`] = String(pred.groupId);
            body[`index${idx}`] = String(pred.index);
            body[`pickid${idx}`] = String(pred.pickId);
            body[`itemid${idx}`] = pred.itemId;
        });

        const response = yield* http.post(url, body) as Effect.Effect<
            RawUploadResponse,
            ApiError | NetworkError
        >;
        return response.result;
    });
