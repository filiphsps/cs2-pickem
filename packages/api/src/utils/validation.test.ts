import { describe, it, expect } from "vitest"
import {
  validateSteamId,
  validateAuthCode,
  validateEventId,
  validateUserAuthParams,
  validateUploadPredictionParams,
  validateUploadLineupParams,
} from "./validation.js"
import { ValidationError } from "../errors.js"

describe("validateSteamId", () => {
  it("should accept valid 17-digit Steam ID", () => {
    expect(() => validateSteamId("76561198012345678")).not.toThrow()
  })

  it("should reject Steam ID with wrong length", () => {
    expect(() => validateSteamId("1234567890")).toThrow(ValidationError)
    expect(() => validateSteamId("123456789012345678")).toThrow(ValidationError)
  })

  it("should reject Steam ID with non-numeric characters", () => {
    expect(() => validateSteamId("7656119801234567A")).toThrow(ValidationError)
  })
})

describe("validateAuthCode", () => {
  it("should accept valid auth code format", () => {
    expect(() => validateAuthCode("ABCD-EFGHI-JKLM")).not.toThrow()
    expect(() => validateAuthCode("1234-56789-0ABC")).not.toThrow()
  })

  it("should be case insensitive", () => {
    expect(() => validateAuthCode("abcd-efghi-jklm")).not.toThrow()
  })

  it("should reject invalid formats", () => {
    expect(() => validateAuthCode("ABCDEFGHIJKLM")).toThrow(ValidationError)
    expect(() => validateAuthCode("ABC-DEFGH-IJK")).toThrow(ValidationError)
    expect(() => validateAuthCode("ABCDE-FGHIJ-KLMNO")).toThrow(ValidationError)
  })
})

describe("validateEventId", () => {
  it("should accept positive integers", () => {
    expect(() => validateEventId(25)).not.toThrow()
    expect(() => validateEventId(1)).not.toThrow()
  })

  it("should reject zero and negative numbers", () => {
    expect(() => validateEventId(0)).toThrow(ValidationError)
    expect(() => validateEventId(-1)).toThrow(ValidationError)
  })

  it("should reject non-integers", () => {
    expect(() => validateEventId(1.5)).toThrow(ValidationError)
  })
})

describe("validateUserAuthParams", () => {
  const validParams = {
    eventId: 25,
    steamId: "76561198012345678",
    authCode: "ABCD-EFGHI-JKLM",
  }

  it("should accept valid params", () => {
    expect(() => validateUserAuthParams(validParams)).not.toThrow()
  })

  it("should reject invalid steamId", () => {
    expect(() => validateUserAuthParams({ ...validParams, steamId: "invalid" })).toThrow(ValidationError)
  })
})

describe("validateUploadPredictionParams", () => {
  const validParams = {
    eventId: 25,
    steamId: "76561198012345678",
    authCode: "ABCD-EFGHI-JKLM",
    sectionId: 15,
    groupId: 29,
    index: 0,
    pickId: 57,
    itemId: "429500386",
  }

  it("should accept valid params", () => {
    expect(() => validateUploadPredictionParams(validParams)).not.toThrow()
  })

  it("should reject invalid sectionId", () => {
    expect(() => validateUploadPredictionParams({ ...validParams, sectionId: 0 })).toThrow(ValidationError)
  })

  it("should reject empty itemId", () => {
    expect(() => validateUploadPredictionParams({ ...validParams, itemId: "" })).toThrow(ValidationError)
  })
})

describe("validateUploadLineupParams", () => {
  const validLineup = [
    { pickId: 1, itemId: "item1" },
    { pickId: 2, itemId: "item2" },
    { pickId: 3, itemId: "item3" },
    { pickId: 4, itemId: "item4" },
    { pickId: 5, itemId: "item5" },
  ]

  const validParams = {
    eventId: 25,
    steamId: "76561198012345678",
    authCode: "ABCD-EFGHI-JKLM",
    sectionId: 23,
    lineup: validLineup,
  }

  it("should accept valid params with 5 players", () => {
    expect(() => validateUploadLineupParams(validParams)).not.toThrow()
  })

  it("should reject lineup with wrong player count", () => {
    expect(() => validateUploadLineupParams({ ...validParams, lineup: validLineup.slice(0, 4) })).toThrow(
      ValidationError,
    )

    expect(() =>
      validateUploadLineupParams({
        ...validParams,
        lineup: [...validLineup, { pickId: 6, itemId: "item6" }],
      }),
    ).toThrow(ValidationError)
  })

  it("should reject lineup with invalid player data", () => {
    const invalidLineup = validLineup.map((p, i) => (i === 0 ? { pickId: 0, itemId: "item" } : p))
    expect(() => validateUploadLineupParams({ ...validParams, lineup: invalidLineup })).toThrow(ValidationError)
  })
})
