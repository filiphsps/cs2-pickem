import { Cause, Effect, Exit } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, NetworkError } from "../errors.js";
import { makeHttpClient } from "./client.js";

describe("makeHttpClient", () => {
    const mockFetch = vi.fn();
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        globalThis.fetch = mockFetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.resetAllMocks();
    });

    describe("get", () => {
        it("should make GET request with params", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: "test" }),
            });

            const client = makeHttpClient();
            const result = await Effect.runPromise(
                client.get("https://api.example.com", { key: "value" })
            );

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com?key=value");
            expect(result).toEqual({ data: "test" });
        });

        it("should handle API errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: "Forbidden",
            });

            const client = makeHttpClient();
            const exit = await Effect.runPromiseExit(client.get("https://api.example.com"));

            expect(Exit.isFailure(exit)).toBe(true);
            if (Exit.isFailure(exit)) {
                const errorOption = Cause.failureOption(exit.cause);
                expect(errorOption._tag).toBe("Some");
                if (errorOption._tag === "Some") {
                    const error = errorOption.value as ApiError;
                    expect(error).toBeInstanceOf(ApiError);
                    expect(error.statusCode).toBe(403);
                    expect(error.message).toContain("Forbidden");
                }
            }
        });

        it("should handle network errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network failed"));

            const client = makeHttpClient();
            const exit = await Effect.runPromiseExit(client.get("https://api.example.com"));

            expect(Exit.isFailure(exit)).toBe(true);
            if (Exit.isFailure(exit)) {
                const errorOption = Cause.failureOption(exit.cause);
                expect(errorOption._tag).toBe("Some");
                if (errorOption._tag === "Some") {
                    const error = errorOption.value;
                    expect(error).toBeInstanceOf(NetworkError);
                    expect(error.message).toContain("Network failed");
                }
            }
        });
    });

    describe("post", () => {
        it("should make POST request with body", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            const client = makeHttpClient();
            const result = await Effect.runPromise(
                client.post("https://api.example.com", { key: "value" })
            );

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "key=value",
            });
            expect(result).toEqual({ success: true });
        });

        it("should handle rate limit errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                statusText: "Too Many Requests",
            });

            const client = makeHttpClient();
            await expect(
                Effect.runPromise(client.post("https://api.example.com", {}))
            ).rejects.toMatchObject({
                message: expect.stringContaining("Too many requests"),
            });
        });
    });
});
