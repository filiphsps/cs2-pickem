import { Effect, Layer } from "effect";
import * as Fantasy from "./endpoints/fantasy.js";
import * as Inventory from "./endpoints/inventory.js";
import * as Items from "./endpoints/items.js";
import * as Predictions from "./endpoints/predictions.js";
import * as Tournament from "./endpoints/tournament.js";
import { convertError } from "./errors.js";
import { HttpClient, makeHttpClient } from "./http/client.js";
import type {
    ClientConfig,
    FantasyLineup,
    MarketUrlParams,
    SteamInventory,
    Team,
    TournamentItems,
    TournamentLayout,
    UploadLineupParams,
    UploadMultipleParams,
    UploadPredictionParams,
    UploadResult,
    UserAuthParams,
    UserPredictions,
} from "./types.js";
import { buildMarketUrl } from "./utils/market.js";
import { teamNameMap } from "./utils/teams.js";

/**
 * Represents the main client for interacting with the CS2 Pick'em API.
 */
export interface PickEmClient {
    /**
     * Fetches the tournament layout for a given event.
     * @param eventId The ID of the tournament event.
     * @returns A promise that resolves with the tournament layout.
     */
    getTournamentLayout(eventId: number): Promise<TournamentLayout>;

    /**
     * Fetches the user's predictions for a given tournament.
     * @param params The user authentication parameters.
     * @returns A promise that resolves with the user's predictions.
     */
    getPredictions(params: UserAuthParams): Promise<UserPredictions>;

    /**
     * Uploads a single prediction for the user.
     * @param params The parameters for the prediction to upload.
     * @returns A promise that resolves with the result of the upload.
     */
    uploadPrediction(params: UploadPredictionParams): Promise<UploadResult>;

    /**
     * Uploads multiple predictions for the user.
     * @param params The parameters for the predictions to upload.
     * @returns A promise that resolves with the result of the upload.
     */
    uploadMultiplePredictions(params: UploadMultipleParams): Promise<UploadResult>;

    /**
     * Fetches the tournament items for a given event.
     * @param params The user authentication parameters.
     * @returns A promise that resolves with the tournament items.
     */
    getTournamentItems(params: UserAuthParams): Promise<TournamentItems>;

    /**
     * Fetches the user's Steam inventory.
     * @param steamId The user's Steam ID.
     * @returns A promise that resolves with the user's inventory.
     */
    getInventory(steamId: string): Promise<SteamInventory>;

    /**
     * Fetches the user's fantasy lineup for a given tournament.
     * @param params The user authentication parameters.
     * @returns A promise that resolves with the user's fantasy lineup.
     */
    getFantasyLineup(params: UserAuthParams): Promise<FantasyLineup>;

    /**
     * Uploads the user's fantasy lineup for a given tournament.
     * @param params The parameters for the fantasy lineup to upload.
     * @returns A promise that resolves with the result of the upload.
     */
    uploadFantasyLineup(params: UploadLineupParams): Promise<UploadResult>;

    /**
     * Builds a market URL for a given item.
     * @param params The parameters for the market URL.
     * @returns The market URL string.
     */
    getMarketUrl(params: MarketUrlParams): string;
}

const DEFAULT_BASE_URL = "https://api.steampowered.com";

/**
 * Converts an Effect to a Promise, handling errors.
 * @param effect The Effect to convert.
 * @returns A promise that resolves with the result of the Effect.
 * @internal
 */
const toPromise = <A, E>(effect: Effect.Effect<A, E, HttpClient>): Promise<A> => {
    const httpLayer = Layer.succeed(HttpClient, makeHttpClient());
    const provided = Effect.provide(effect, httpLayer);

    return Effect.runPromise(provided).catch((error) => {
        throw convertError(error);
    });
};

/**
 * Creates a new PickEmClient instance.
 * @param config The client configuration.
 * @returns A new PickEmClient instance.
 */
export const createPickEmClient = (config: ClientConfig): PickEmClient => {
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const { apiKey } = config;

    return {
        getTournamentLayout: (eventId) =>
            toPromise(Tournament.getTournamentLayout(baseUrl, apiKey, eventId)),

        getPredictions: (params) => toPromise(Predictions.getPredictions(baseUrl, apiKey, params)),

        uploadPrediction: (params) =>
            toPromise(Predictions.uploadPrediction(baseUrl, apiKey, params)),

        uploadMultiplePredictions: (params) =>
            toPromise(Predictions.uploadMultiplePredictions(baseUrl, apiKey, params)),

        getTournamentItems: (params) =>
            toPromise(Items.getTournamentItems(baseUrl, apiKey, params)),

        getFantasyLineup: (params) => toPromise(Fantasy.getFantasyLineup(baseUrl, apiKey, params)),

        uploadFantasyLineup: (params) =>
            toPromise(Fantasy.uploadFantasyLineup(baseUrl, apiKey, params)),

        getInventory: (steamId) => toPromise(Inventory.getInventory(steamId)),

        getMarketUrl: (params) => buildMarketUrl(params),
    };
};

/**
 * Enriches the tournament layout with team names from the user's inventory and a hard-coded map.
 * @param layout The tournament layout to enrich.
 * @param items The tournament items.
 * @param inventory The user's Steam inventory.
 * @returns The enriched tournament layout.
 */
export const enrichLayout = (
    layout: TournamentLayout,
    items: TournamentItems,
    inventory: SteamInventory
): TournamentLayout => {
    // Create a map of assetId -> marketHashName
    const assetIdToName = new Map<string, string>();

    // 1. Map assetId to classId/instanceId
    const assetMap = new Map<string, { classid: string; instanceid: string }>();
    if (inventory.assets) {
        for (const asset of inventory.assets) {
            assetMap.set(asset.assetid, { classid: asset.classid, instanceid: asset.instanceid });
        }
    }

    // 2. Map classId/instanceId to description name
    const descMap = new Map<string, string>();
    if (inventory.descriptions) {
        for (const desc of inventory.descriptions) {
            const key = `${desc.classid}_${desc.instanceid}`;
            descMap.set(key, desc.market_hash_name);
        }
    }

    // 3. Combine to map assetId -> name
    for (const [assetId, ids] of assetMap.entries()) {
        const key = `${ids.classid}_${ids.instanceid}`;
        const name = descMap.get(key);
        if (name) {
            assetIdToName.set(assetId, name);
        }
    }

    // 4. Enrich layout
    const enrichedSections = layout.sections.map((section) => ({
        ...section,
        groups: section.groups.map((group) => ({
            ...group,
            teams: group.teams.map((team): Team => {
                const originalName = team.name ?? "Unknown";

                // Try to get name from hard-coded map first
                const mappedName = teamNameMap.get(team.pickId);
                if (mappedName && mappedName !== "TBD") {
                    return { pickId: team.pickId, name: mappedName };
                }

                // Find sticker for this team
                const sticker = items.items.find(
                    (item) => item.type === "team" && item.teamId === team.pickId
                );

                if (!sticker) return { pickId: team.pickId, name: originalName };

                const marketName = assetIdToName.get(sticker.itemId);
                if (!marketName) return { pickId: team.pickId, name: originalName };

                // Extract team name from "Sticker | Team Name | Tournament"
                // Example: "Sticker | FaZe Clan | Budapest 2025"
                const parts = marketName.split(" | ");
                if (parts.length >= 2 && parts[1]) {
                    return { pickId: team.pickId, name: parts[1] };
                }

                return { pickId: team.pickId, name: marketName };
            }),
        })),
    }));

    return { sections: enrichedSections };
};
