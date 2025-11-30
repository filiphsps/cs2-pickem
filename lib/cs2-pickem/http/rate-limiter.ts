import { Effect, Schedule, Duration } from "effect"
import { RateLimitError } from "../errors"

export interface RateLimiterConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
}

/**
 * Wraps an effect with retry logic for rate limiting
 */
export const withRetry = <A, E, R>(effect: Effect.Effect<A, E, R>, config: RateLimiterConfig = DEFAULT_CONFIG) => {
  const schedule = Schedule.exponential(Duration.millis(config.initialDelay)).pipe(
    Schedule.intersect(Schedule.recurs(config.maxRetries)),
    Schedule.whileInput((error: unknown) => error instanceof RateLimitError),
  )

  return Effect.retry(effect, schedule)
}

/**
 * Create a simple delay effect
 */
export const delay = (ms: number) => Effect.sleep(Duration.millis(ms))
