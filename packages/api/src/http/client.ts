import { Effect, Context } from "effect"
import { ApiError, NetworkError, mapHttpError } from "../errors.js"

export interface HttpClient {
  get(url: string, params?: Record<string, string>): Effect.Effect<any, ApiError | NetworkError>
  post(url: string, body: Record<string, string>): Effect.Effect<any, ApiError | NetworkError>
}

export const HttpClient = Context.GenericTag<HttpClient>("HttpClient")

// Works in both Node.js and browser
export const makeHttpClient = (): HttpClient => ({
  get: (url: string, params?: Record<string, string>) =>
    Effect.tryPromise({
      try: async () => {
        const searchParams = new URLSearchParams(params)
        const fullUrl = params ? `${url}?${searchParams}` : url
        const response = await fetch(fullUrl)

        if (!response.ok) {
          throw mapHttpError(response.status, response.statusText)
        }

        return response.json()
      },
      catch: (error) => {
        if (error instanceof ApiError) return error
        return new NetworkError({
          message: String(error),
          cause: error,
        })
      },
    }),

  post: (url: string, body: Record<string, string>) =>
    Effect.tryPromise({
      try: async () => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(body).toString(),
        })

        if (!response.ok) {
          throw mapHttpError(response.status, response.statusText)
        }

        return response.json()
      },
      catch: (error) => {
        if (error instanceof ApiError) return error
        return new NetworkError({
          message: String(error),
          cause: error,
        })
      },
    }),
})
