import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Effect } from "effect"
import { makeHttpClient } from "./client.js"
import { ApiError, NetworkError } from "../errors.js"

describe("makeHttpClient", () => {
  const mockFetch = vi.fn()
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = mockFetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.resetAllMocks()
  })

  describe("get", () => {
    it("should make GET request with params", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      })

      const client = makeHttpClient()
      const result = await Effect.runPromise(client.get("https://api.example.com", { key: "value" }))

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com?key=value")
      expect(result).toEqual({ data: "test" })
    })

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      })

      const client = makeHttpClient()
      await expect(Effect.runPromise(client.get("https://api.example.com"))).rejects.toBeInstanceOf(ApiError)
    })

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failed"))

      const client = makeHttpClient()
      await expect(Effect.runPromise(client.get("https://api.example.com"))).rejects.toBeInstanceOf(NetworkError)
    })
  })

  describe("post", () => {
    it("should make POST request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const client = makeHttpClient()
      const result = await Effect.runPromise(client.post("https://api.example.com", { key: "value" }))

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "key=value",
      })
      expect(result).toEqual({ success: true })
    })

    it("should handle rate limit errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      })

      const client = makeHttpClient()
      await expect(Effect.runPromise(client.post("https://api.example.com", {}))).rejects.toMatchObject({
        message: expect.stringContaining("Too many requests"),
      })
    })
  })
})
