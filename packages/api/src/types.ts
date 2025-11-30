/**
 * Represents the user's authentication parameters for the Steam API.
 */
export interface UserAuthParams {
    /** The ID of the tournament event. */
    eventId: number;
    /** The user's Steam ID. */
    steamId: string;
    /** The user's authentication code. */
    authCode: string;
}

/**
 * Represents the layout of a tournament.
 */
export interface TournamentLayout {
    /** The sections of the tournament (e.g., Stage I, Stage II). */
    sections: TournamentSection[];
}

/**
 * Represents a section of a tournament.
 */
export interface TournamentSection {
    /** The ID of the section. */
    sectionId: number;
    /** The name of the section. */
    name: string;
    /** The groups of matches within the section. */
    groups: MatchGroup[];
}

/**
 * Represents a group of matches in a tournament.
 */
export interface MatchGroup {
    /** The ID of the group. */
    groupId: number;
    /** The name of the group. */
    name: string;
    /** The number of points awarded for a correct pick in this group. */
    pointsPerPick: number;
    /** Whether predictions are currently allowed for this group. */
    picksAllowed: boolean;
    /** The teams participating in this group. */
    teams: Team[];
    /** The correct picks for this group, if available. */
    picks?: Pick[];
}

/**
 * Represents a team in a tournament.
 */
export interface Team {
    /** The ID used for making picks. */
    pickId: number;
    /** The name of the team. */
    name: string;
}

/**
 * Represents a correct pick in a tournament group.
 */
export interface Pick {
    /** The index of the pick. */
    index: number;
    /** The IDs of the correct picks. */
    pickIds: number[];
}

/**
 * Represents the user's predictions for a tournament.
 */
export interface UserPredictions {
    /** The list of predictions made by the user. */
    predictions: Prediction[];
}

/**
 * Represents a single prediction made by the user.
 */
export interface Prediction {
    /** The ID of the group the prediction is for. */
    groupId: number;
    /** The ID of the picked team or player. */
    pick: number;
}

/**
 * Represents the parameters for uploading a single prediction.
 */
export interface UploadPredictionParams extends UserAuthParams {
    /** The ID of the section the prediction is for. */
    sectionId: number;
    /** The ID of the group the prediction is for. */
    groupId: number;
    /** The index of the pick. */
    index: number;
    /** The ID of the picked team or player. */
    pickId: number;
    /** The ID of the item used for the pick. */
    itemId: string;
}

/**
 * Represents the parameters for uploading multiple predictions.
 */
export interface UploadMultipleParams extends UserAuthParams {
    /** The list of predictions to upload. */
    predictions: Array<{
        sectionId: number;
        groupId: number;
        index: number;
        pickId: number;
        itemId: string;
    }>;
}

/**
 * Represents the user's fantasy lineup for a tournament.
 */
export interface FantasyLineup {
    /** The teams in the fantasy lineup. */
    teams: FantasyTeam[];
}

/**
 * Represents a team in the user's fantasy lineup.
 */
export interface FantasyTeam {
    /** The ID of the section the fantasy team is for. */
    sectionId: number;
    /** The list of player schema IDs in the fantasy team. */
    picks: number[];
}

/**
 * Represents the parameters for uploading a fantasy lineup.
 */
export interface UploadLineupParams extends UserAuthParams {
    /** The ID of the section the lineup is for. */
    sectionId: number;
    /** The list of picks in the lineup. */
    lineup: Array<{
        pickId: number;
        itemId: string;
    }>;
}

/**
 * Represents the items for a tournament.
 */
export interface TournamentItems {
    /** The list of tournament items. */
    items: TournamentItem[];
}

/**
 * Represents a single tournament item.
 */
export interface TournamentItem {
    /** The ID of the item. */
    itemId: string;
    /** The type of the item. */
    type: "team" | "player";
    /** The ID of the team, if the item is a team item. */
    teamId?: number;
    /** The ID of the player, if the item is a player item. */
    playerId?: number;
}

/**
 * Represents the result of an upload operation.
 */
export interface UploadResult {
    /** The ID of the item used for the upload. */
    itemId?: string;
    /** The ID of the item at index 0. */
    itemId0?: string;
    /** The ID of the item at index 1. */
    itemId1?: string;
    /** The ID of the item at index 2. */
    itemId2?: string;
    /** The ID of the item at index 3. */
    itemId3?: string;
    /** The ID of the item at index 4. */
    itemId4?: string;
}

/**
 * Represents the parameters for building a market URL.
 */
export interface MarketUrlParams {
    /** The type of the item. */
    type: "team" | "player";
    /** The ID of the team, if applicable. */
    teamId?: number;
    /** The tag of the player, if applicable. */
    playerTag?: string;
    /** The ID of the tournament. */
    tournamentId: number;
}

/**
 * Represents the client configuration.
 */
export interface ClientConfig {
    /** The Steam API key. */
    apiKey: string;
    /** The base URL for the API. Defaults to the official Steam API URL. */
    baseUrl?: string;
}

/**
 * Represents the user's Steam inventory.
 */
export interface SteamInventory {
    /** The list of assets in the inventory. */
    assets: SteamInventoryAsset[];
    /** The list of descriptions for the assets. */
    descriptions: SteamInventoryDescription[];
    /** The total number of items in the inventory. */
    total_inventory_count: number;
    /** The success status of the inventory fetch. */
    success: number;
    /** The reason for the inventory fetch result. */
    rwgrsn: number;
}

/**
 * Represents a single asset in the user's Steam inventory.
 */
export interface SteamInventoryAsset {
    /** The App ID of the game. */
    appid: number;
    /** The context ID of the inventory. */
    contextid: string;
    /** The ID of the asset. */
    assetid: string;
    /** The ID of the class of the asset. */
    classid: string;
    /** The ID of the instance of the asset. */
    instanceid: string;
    /** The amount of the asset. */
    amount: string;
}

/**
 * Represents the description of an asset in the user's Steam inventory.
 */
export interface SteamInventoryDescription {
    /** The App ID of the game. */
    appid: number;
    /** The ID of the class of the asset. */
    classid: string;
    /** The ID of the instance of the asset. */
    instanceid: string;
    /** The currency of the item's price. */
    currency: number;
    /** The background color of the item. */
    background_color: string;
    /** The URL of the item's icon. */
    icon_url: string;
    /** The descriptions of the item. */
    descriptions: {
        type: string;
        value: string;
        name?: string;
        color?: string;
    }[];
    /** Whether the item is tradable. */
    tradable: number;
    /** The name of the item. */
    name: string;
    /** The color of the item's name. */
    name_color: string;
    /** The type of the item. */
    type: string;
    /** The market name of the item. */
    market_name: string;
    /** The market hash name of the item. */
    market_hash_name: string;
    /** The tags associated with the item. */
    tags?: {
        category: string;
        internal_name: string;
        localized_category_name: string;
        localized_tag_name: string;
        color?: string;
    }[];
}
