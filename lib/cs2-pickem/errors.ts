import { Data } from "effect"

// ===== User-Facing Errors =====
export class PickEmError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = "PickEmError"
  }
}

export class PickEmValidationError extends PickEmError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message)
    this.name = "PickEmValidationError"
  }
}

export class PickEmRateLimitError extends PickEmError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
  ) {
    super(message)
    this.name = "PickEmRateLimitError"
  }
}

export class PickEmPreconditionError extends PickEmError {
  constructor(message: string) {
    super(message)
    this.name = "PickEmPreconditionError"
  }
}

export class PickEmConflictError extends PickEmError {
  constructor(message: string) {
    super(message)
    this.name = "PickEmConflictError"
  }
}

export class PickEmGoneError extends PickEmError {
  constructor(message: string) {
    super(message)
    this.name = "PickEmGoneError"
  }
}

// ===== Internal Effect Errors =====
export class ApiError extends Data.TaggedError("ApiError")<{
  statusCode: number
  message: string
  cause?: unknown
}> {}

export class NetworkError extends Data.TaggedError("NetworkError")<{
  message: string
  cause?: unknown
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string
  field?: string
}> {}

export class RateLimitError extends Data.TaggedError("RateLimitError")<{
  message: string
  retryAfter?: number
}> {}

export class PreconditionFailedError extends Data.TaggedError("PreconditionFailedError")<{
  message: string
}> {}

export class ConflictError extends Data.TaggedError("ConflictError")<{
  message: string
}> {}

export class GoneError extends Data.TaggedError("GoneError")<{
  message: string
}> {}

// ===== Error Converter =====
export const convertError = (error: unknown): PickEmError => {
  if (error instanceof RateLimitError) {
    return new PickEmRateLimitError(error.message, error.retryAfter)
  }
  if (error instanceof ValidationError) {
    return new PickEmValidationError(error.message, error.field)
  }
  if (error instanceof PreconditionFailedError) {
    return new PickEmPreconditionError(error.message)
  }
  if (error instanceof ConflictError) {
    return new PickEmConflictError(error.message)
  }
  if (error instanceof GoneError) {
    return new PickEmGoneError(error.message)
  }
  if (error instanceof ApiError) {
    return new PickEmError(error.message, error.statusCode, error.cause)
  }
  if (error instanceof NetworkError) {
    return new PickEmError(error.message, undefined, error.cause)
  }
  return new PickEmError(String(error))
}

// ===== HTTP Error Mapper =====
export const mapHttpError = (statusCode: number, message: string) => {
  switch (statusCode) {
    case 400:
      return new ApiError({
        statusCode,
        message: "Bad Request: Invalid tournament parameters or item IDs",
      })
    case 403:
      return new ApiError({
        statusCode,
        message: "Forbidden: Invalid Steam auth code - generate a new one at help.steampowered.com",
      })
    case 404:
      return new ApiError({
        statusCode,
        message: "Not Found: Sticker item not owned by user or incorrect team/player ID",
      })
    case 405:
      return new ApiError({
        statusCode,
        message: "Method Not Allowed: Endpoint not available for this tournament",
      })
    case 409:
      return new ConflictError({
        message: "Predictions not allowed yet for this stage - wait for stage to unlock",
      })
    case 410:
      return new GoneError({
        message: "Prediction window closed - matches have already started",
      })
    case 412:
      return new PreconditionFailedError({
        message: "Cannot place pick: conflicts with existing predictions from previous stages",
      })
    case 429:
      return new RateLimitError({
        message: "Too many requests - reduce API call frequency",
      })
    case 500:
      return new ApiError({ statusCode, message: "Internal Server Error" })
    case 503:
      return new ApiError({
        statusCode,
        message: "Service Unavailable - Steam servers may be down or under maintenance",
      })
    case 504:
      return new ApiError({
        statusCode,
        message: "Gateway Timeout - request may complete later, check predictions status",
      })
    default:
      return new ApiError({ statusCode, message })
  }
}
