import { Effect } from "effect";
import type { ApiError, NetworkError } from "../errors.js";
import { HttpClient } from "../http/client.js";
import type { SteamInventory } from "../types.js";

const INVENTORY_ENDPOINT = (steamId: string) =>
    `https://steamcommunity.com/inventory/${steamId}/730/2`;

/**
 * Fetches the user's Steam inventory.
 * @param steamId The user's Steam ID.
 * @returns An Effect that resolves with the user's inventory.
 * @internal
 */
export const getInventory = (
    steamId: string
): Effect.Effect<SteamInventory, ApiError | NetworkError, HttpClient> =>
    Effect.gen(function* () {
        const http = yield* HttpClient;
        const url = INVENTORY_ENDPOINT(steamId);

        const response = yield* http.get(url, {
            l: "english",
            count: "500",
        }) as Effect.Effect<SteamInventory, ApiError | NetworkError>;

        return response;
    }).pipe(
        Effect.catchTags({
            ApiError: () =>
                Effect.succeed({
                    assets: [],
                    descriptions: [],
                    total_inventory_count: 0,
                    success: 1,
                    rwgrsn: 0,
                }),
        })
    );
