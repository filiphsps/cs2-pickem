import { ValidationError } from "../errors.js"
import type { UserAuthParams, UploadPredictionParams, UploadLineupParams } from "../types.js"

const STEAM_ID_REGEX = /^\d{17}$/
const AUTH_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{5}-[A-Z0-9]{4}$/i

/**
 * Validate Steam ID format (SteamID64)
 */
export const validateSteamId = (steamId: string): void => {
  if (!STEAM_ID_REGEX.test(steamId)) {
    throw new ValidationError({
      message: "Steam ID must be 17 digits (SteamID64 format)",
      field: "steamId",
    })
  }
}

/**
 * Validate auth code format
 */
export const validateAuthCode = (authCode: string): void => {
  if (!AUTH_CODE_REGEX.test(authCode)) {
    throw new ValidationError({
      message: "Auth code must be in format XXXX-XXXXX-XXXX",
      field: "authCode",
    })
  }
}

/**
 * Validate event ID
 */
export const validateEventId = (eventId: number): void => {
  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw new ValidationError({
      message: "Event ID must be a positive integer",
      field: "eventId",
    })
  }
}

/**
 * Validate user auth params
 */
export const validateUserAuthParams = (params: UserAuthParams): void => {
  validateEventId(params.eventId)
  validateSteamId(params.steamId)
  validateAuthCode(params.authCode)
}

/**
 * Validate upload prediction params
 */
export const validateUploadPredictionParams = (params: UploadPredictionParams): void => {
  validateUserAuthParams(params)

  if (!Number.isInteger(params.sectionId) || params.sectionId <= 0) {
    throw new ValidationError({
      message: "Section ID must be a positive integer",
      field: "sectionId",
    })
  }

  if (!Number.isInteger(params.groupId) || params.groupId <= 0) {
    throw new ValidationError({
      message: "Group ID must be a positive integer",
      field: "groupId",
    })
  }

  if (!Number.isInteger(params.index) || params.index < 0) {
    throw new ValidationError({
      message: "Index must be a non-negative integer",
      field: "index",
    })
  }

  if (!Number.isInteger(params.pickId) || params.pickId <= 0) {
    throw new ValidationError({
      message: "Pick ID must be a positive integer",
      field: "pickId",
    })
  }

  if (!params.itemId || params.itemId.trim() === "") {
    throw new ValidationError({
      message: "Item ID is required",
      field: "itemId",
    })
  }
}

/**
 * Validate fantasy lineup params
 */
export const validateUploadLineupParams = (params: UploadLineupParams): void => {
  validateUserAuthParams(params)

  if (!Number.isInteger(params.sectionId) || params.sectionId <= 0) {
    throw new ValidationError({
      message: "Section ID must be a positive integer",
      field: "sectionId",
    })
  }

  if (!Array.isArray(params.lineup) || params.lineup.length !== 5) {
    throw new ValidationError({
      message: "Fantasy lineup must have exactly 5 players",
      field: "lineup",
    })
  }

  params.lineup.forEach((player, idx) => {
    if (!Number.isInteger(player.pickId) || player.pickId <= 0) {
      throw new ValidationError({
        message: `Player ${idx + 1} pick ID must be a positive integer`,
        field: `lineup[${idx}].pickId`,
      })
    }

    if (!player.itemId || player.itemId.trim() === "") {
      throw new ValidationError({
        message: `Player ${idx + 1} item ID is required`,
        field: `lineup[${idx}].itemId`,
      })
    }
  })
}
