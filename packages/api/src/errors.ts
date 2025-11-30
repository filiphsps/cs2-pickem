import { Data } from "effect";

/**
 * Base error class for all user-facing errors in the Pick'em client.
 */
export class PickEmError extends Error {
    /**
     * @param message The error message.
     * @param statusCode The HTTP status code of the error, if applicable.
     * @param cause The original cause of the error.
     */
    constructor(
        message: string,
        public readonly statusCode?: number,
        public override readonly cause?: unknown
    ) {
        super(message);
        this.name = "PickEmError";
    }
}

/**
 * Error class for validation errors.
 */
export class PickEmValidationError extends PickEmError {
    /**
     * @param message The error message.
     * @param field The name of the field that failed validation.
     */
    constructor(
        message: string,
        public readonly field?: string
    ) {
        super(message);
        this.name = "PickEmValidationError";
    }
}

/**
 * Error class for rate limit errors.
 */
export class PickEmRateLimitError extends PickEmError {
    /**
     * @param message The error message.
     * @param retryAfter The number of seconds to wait before retrying.
     */
    constructor(
        message: string,
        public readonly retryAfter?: number
    ) {
        super(message);
        this.name = "PickEmRateLimitError";
    }
}

/**
 * Error class for precondition failed errors.
 */
export class PickEmPreconditionError extends PickEmError {
    constructor(message: string) {
        super(message);
        this.name = "PickEmPreconditionError";
    }
}

/**
 * Error class for conflict errors.
 */
export class PickEmConflictError extends PickEmError {
    constructor(message: string) {
        super(message);
        this.name = "PickEmConflictError";
    }
}

/**
 * Error class for "gone" errors (e.g., prediction window closed).
 */
export class PickEmGoneError extends PickEmError {
    constructor(message: string) {
        super(message);
        this.name = "PickEmGoneError";
    }
}

// ===== Internal Effect Errors =====

/**
 * Represents an error from the API.
 * @internal
 */
export class ApiError extends Data.TaggedError("ApiError")<{
    statusCode: number;
    message: string;
    cause?: unknown;
}> {}

/**
 * Represents a network error.
 * @internal
 */
export class NetworkError extends Data.TaggedError("NetworkError")<{
    message: string;
    cause?: unknown;
}> {}

/**
 * Represents a validation error.
 * @internal
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
    message: string;
    field?: string;
}> {}

/**
 * Represents a rate limit error.
 * @internal
 */
export class RateLimitError extends Data.TaggedError("RateLimitError")<{
    message: string;
    retryAfter?: number;
}> {}

/**
 * Represents a precondition failed error.
 * @internal
 */
export class PreconditionFailedError extends Data.TaggedError("PreconditionFailedError")<{
    message: string;
}> {}

/**
 * Represents a conflict error.
 * @internal
 */
export class ConflictError extends Data.TaggedError("ConflictError")<{
    message: string;
}> {}

/**
 * Represents a "gone" error.
 * @internal
 */
export class GoneError extends Data.TaggedError("GoneError")<{
    message: string;
}> {}

// ===== Error Converter =====

/**
 * Converts an internal Effect error to a user-facing PickEmError.
 * @param error The error to convert.
 * @returns A PickEmError instance.
 * @internal
 */
export const convertError = (error: unknown): PickEmError => {
    if (error instanceof RateLimitError) {
        return new PickEmRateLimitError(error.message, error.retryAfter);
    }
    if (error instanceof ValidationError) {
        return new PickEmValidationError(error.message, error.field);
    }
    if (error instanceof PreconditionFailedError) {
        return new PickEmPreconditionError(error.message);
    }
    if (error instanceof ConflictError) {
        return new PickEmConflictError(error.message);
    }
    if (error instanceof GoneError) {
        return new PickEmGoneError(error.message);
    }
    if (error instanceof ApiError) {
        return new PickEmError(error.message, error.statusCode, error.cause);
    }
    if (error instanceof NetworkError) {
        return new PickEmError(error.message, undefined, error.cause);
    }
    return new PickEmError(String(error));
};

// ===== HTTP Error Mapper =====

/**
 * Maps an HTTP status code to an appropriate internal error.
 * @param statusCode The HTTP status code.
 * @param message The error message.
 * @returns An internal error instance.
 * @internal
 */
export const mapHttpError = (statusCode: number, message: string) => {
    switch (statusCode) {
        case 400:
            return new ApiError({
                statusCode,
                message: "Bad Request: Invalid tournament parameters or item IDs",
            });
        case 403:
            return new ApiError({
                statusCode,
                message:
                    "Forbidden: Invalid Steam auth code - generate a new one at help.steampowered.com",
            });
        case 404:
            return new ApiError({
                statusCode,
                message: "Not Found: Sticker item not owned by user or incorrect team/player ID",
            });
        case 405:
            return new ApiError({
                statusCode,
                message: "Method Not Allowed: Endpoint not available for this tournament",
            });
        case 409:
            return new ConflictError({
                message: "Predictions not allowed yet for this stage - wait for stage to unlock",
            });
        case 410:
            return new GoneError({
                message: "Prediction window closed - matches have already started",
            });
        case 412:
            return new PreconditionFailedError({
                message:
                    "Cannot place pick: conflicts with existing predictions from previous stages",
            });
        case 429:
            return new RateLimitError({
                message: "Too many requests - reduce API call frequency",
            });
        case 500:
            return new ApiError({ statusCode, message: "Internal Server Error" });
        case 503:
            return new ApiError({
                statusCode,
                message: "Service Unavailable - Steam servers may be down or under maintenance",
            });
        case 504:
            return new ApiError({
                statusCode,
                message: "Gateway Timeout - request may complete later, check predictions status",
            });
        default:
            return new ApiError({ statusCode, message });
    }
};
