# CS2 Pick'em API

A modern TypeScript package for interacting with the CS2 Major Pick'em Challenge API. Uses Effect-TS internally with a Promise-based public API.

## Packages

-   **@cs2-pickem/api** - Core API client library
-   **@cs2-pickem/cli** - Command-line interface tool

## Quick Start

### API Package

```bash
npm install @cs2-pickem/api
```

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

// Place a prediction
await client.uploadPrediction({
  eventId: 25,
  steamId: "76561198XXXXXXXX",
  authCode: "AAAA-AAAAA-AAAA",
  sectionId: 15,
  groupId: 29,
  index: 0,
  pickId: 57,
  itemId: "429500386"
})
```

### CLI Tool

```bash
npm install -g @cs2-pickem/cli

# Configure credentials
cs2-pickem config

# View tournament bracket
cs2-pickem layout 25

# View your predictions
cs2-pickem view 25

# Make predictions interactively
cs2-pickem predict 25 --interactive

# Check your score
cs2-pickem score 25
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## License

MIT
