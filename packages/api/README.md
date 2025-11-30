# @cs2-pickem/api

TypeScript client for the CS2 Major Pick'em Challenge API. Uses Effect-TS internally with a simple Promise-based public API.

## Installation

```bash
npm install @cs2-pickem/api
```

## Quick Start

```typescript
import { createPickEmClient } from "@cs2-pickem/api"

const client = createPickEmClient({ 
  apiKey: "your-steam-api-key"
})

// Get tournament structure
const layout = await client.getTournamentLayout(25) // Budapest Major 2025

// View user's predictions
const predictions = await client.getPredictions({
  eventId: 25,
  steamId: "76561198XXXXXXXX",
  authCode: "AAAA-AAAAA-AAAA"
})
```

## API Reference

### createPickEmClient(config)

Creates a new Pick'em API client.

```typescript
const client = createPickEmClient({
  apiKey: "your-steam-api-key",
  baseUrl: "https://api.steampowered.com" // optional
})
```

### client.getTournamentLayout(eventId)

Get tournament structure including sections, groups, and teams.

### client.getPredictions(params)

Get user's current predictions.

### client.uploadPrediction(params)

Place a single prediction.

### client.uploadMultiplePredictions(params)

Place multiple predictions at once.

### client.getTournamentItems(params)

Get user's owned tournament stickers.

### client.getFantasyLineup(params)

Get user's fantasy team lineup.

### client.uploadFantasyLineup(params)

Update fantasy team lineup.

### client.getMarketUrl(params)

Generate Steam Market URL for sticker purchases.

## Error Handling

```typescript
import { 
  PickEmGoneError, 
  PickEmPreconditionError,
  PickEmRateLimitError 
} from "@cs2-pickem/api"

try {
  await client.uploadPrediction(params)
} catch (error) {
  if (error instanceof PickEmGoneError) {
    console.error("Prediction window closed")
  } else if (error instanceof PickEmPreconditionError) {
    console.error("Conflicts with previous predictions")
  } else if (error instanceof PickEmRateLimitError) {
    console.error("Rate limited, retry after:", error.retryAfter)
  }
}
```

## Utilities

### Bracket Scoring

```typescript
import { calculateBracketScore, getCoinTier } from "@cs2-pickem/api"

const score = calculateBracketScore(layout, predictions)
const tier = getCoinTier(score.totalPoints)

console.log(\`Points: \${score.totalPoints}, Tier: \${tier}\`)
```

### Market URLs

```typescript
import { buildMarketUrl } from "@cs2-pickem/api"

const url = buildMarketUrl({
  type: "team",
  teamId: 57,
  tournamentId: 25
})
```

## Browser Usage

This package works in browsers with native fetch support:

```typescript
import { createPickEmClient } from "@cs2-pickem/api"

const client = createPickEmClient({
  apiKey: import.meta.env.VITE_STEAM_API_KEY
})
```

## License

```
MIT
```
