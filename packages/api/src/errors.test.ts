import { describe, expect, it } from "vitest";
import {
    ApiError,
    ConflictError,
    convertError,
    GoneError,
    mapHttpError,
    NetworkError,
    PickEmConflictError,
    PickEmError,
    PickEmGoneError,
    PickEmPreconditionError,
    PickEmRateLimitError,
    PickEmValidationError,
    PreconditionFailedError,
    RateLimitError,
    ValidationError,
} from "./errors.js";

describe("User-facing errors", () => {
    it("should create PickEmError with all properties", () => {
        const error = new PickEmError("Test error", 500, new Error("cause"));
        expect(error.message).toBe("Test error");
        expect(error.statusCode).toBe(500);
        expect(error.cause).toBeInstanceOf(Error);
        expect(error.name).toBe("PickEmError");
    });

    it("should create PickEmValidationError with field", () => {
        const error = new PickEmValidationError("Invalid input", "steamId");
        expect(error.message).toBe("Invalid input");
        expect(error.field).toBe("steamId");
        expect(error.name).toBe("PickEmValidationError");
    });

    it("should create PickEmRateLimitError with retryAfter", () => {
        const error = new PickEmRateLimitError("Too many requests", 30);
        expect(error.message).toBe("Too many requests");
        expect(error.retryAfter).toBe(30);
        expect(error.name).toBe("PickEmRateLimitError");
    });

    it("should create PickEmPreconditionError", () => {
        const error = new PickEmPreconditionError("Conflict with previous");
        expect(error.message).toBe("Conflict with previous");
        expect(error.name).toBe("PickEmPreconditionError");
    });

    it("should create PickEmConflictError", () => {
        const error = new PickEmConflictError("Stage not open");
        expect(error.message).toBe("Stage not open");
        expect(error.name).toBe("PickEmConflictError");
    });

    it("should create PickEmGoneError", () => {
        const error = new PickEmGoneError("Window closed");
        expect(error.message).toBe("Window closed");
        expect(error.name).toBe("PickEmGoneError");
    });
});

describe("convertError", () => {
    it("should convert RateLimitError to PickEmRateLimitError", () => {
        const internalError = new RateLimitError({ message: "Rate limited", retryAfter: 60 });
        const result = convertError(internalError);
        expect(result).toBeInstanceOf(PickEmRateLimitError);
        expect((result as PickEmRateLimitError).retryAfter).toBe(60);
    });

    it("should convert ValidationError to PickEmValidationError", () => {
        const internalError = new ValidationError({ message: "Invalid", field: "test" });
        const result = convertError(internalError);
        expect(result).toBeInstanceOf(PickEmValidationError);
        expect((result as PickEmValidationError).field).toBe("test");
    });

    it("should convert PreconditionFailedError to PickEmPreconditionError", () => {
        const internalError = new PreconditionFailedError({ message: "Precondition failed" });
        const result = convertError(internalError);
        expect(result).toBeInstanceOf(PickEmPreconditionError);
    });

    it("should convert ConflictError to PickEmConflictError", () => {
        const internalError = new ConflictError({ message: "Conflict" });
        const result = convertError(internalError);
        expect(result).toBeInstanceOf(PickEmConflictError);
    });

    it("should convert GoneError to PickEmGoneError", () => {
        const internalError = new GoneError({ message: "Gone" });
        const result = convertError(internalError);
        expect(result).toBeInstanceOf(PickEmGoneError);
    });

    it("should convert ApiError to PickEmError", () => {
        const internalError = new ApiError({ statusCode: 500, message: "Server error" });
        const result = convertError(internalError);
        expect(result).toBeInstanceOf(PickEmError);
        expect(result.statusCode).toBe(500);
    });

    it("should convert NetworkError to PickEmError", () => {
        const internalError = new NetworkError({ message: "Network failed" });
        const result = convertError(internalError);
        expect(result).toBeInstanceOf(PickEmError);
        expect(result.statusCode).toBeUndefined();
    });

    it("should convert unknown errors to PickEmError", () => {
        const result = convertError("Unknown error string");
        expect(result).toBeInstanceOf(PickEmError);
        expect(result.message).toBe("Unknown error string");
    });
});

describe("mapHttpError", () => {
    it("should map 400 to ApiError", () => {
        const error = mapHttpError(400, "Bad Request");
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(400);
    });

    it("should map 403 to ApiError with auth message", () => {
        const error = mapHttpError(403, "Forbidden");
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toContain("auth code");
    });

    it("should map 409 to ConflictError", () => {
        const error = mapHttpError(409, "Conflict");
        expect(error).toBeInstanceOf(ConflictError);
    });

    it("should map 410 to GoneError", () => {
        const error = mapHttpError(410, "Gone");
        expect(error).toBeInstanceOf(GoneError);
    });

    it("should map 412 to PreconditionFailedError", () => {
        const error = mapHttpError(412, "Precondition Failed");
        expect(error).toBeInstanceOf(PreconditionFailedError);
    });

    it("should map 429 to RateLimitError", () => {
        const error = mapHttpError(429, "Too Many Requests");
        expect(error).toBeInstanceOf(RateLimitError);
    });

    it("should map unknown status codes to ApiError", () => {
        const error = mapHttpError(418, "I'm a teapot");
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(418);
    });
});
