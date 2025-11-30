# @cs2-pickem/cli

Command-line interface for managing CS2 Major Pick'em predictions.

## Installation

```bash
npm install -g @cs2-pickem/cli
```

## Setup

Before using the CLI, you need to configure your credentials:

```bash
cs2-pickem config
```

You'll need:
- **Steam Web API Key**: Get it from https://steamcommunity.com/dev/apikey
- **Steam ID (SteamID64)**: Your 17-digit Steam ID
- **Game Auth Code**: Generate at https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128

## Commands

### View Tournament Bracket

```bash
cs2-pickem layout 25
```

### View Your Predictions

```bash
cs2-pickem view 25
```

### Make Predictions (Interactive)

```bash
cs2-pickem predict 25 --interactive
```

### View Your Stickers

```bash
cs2-pickem items 25
```

### Check Your Score

```bash
cs2-pickem score 25
```

### View Fantasy Lineup

```bash
cs2-pickem fantasy 25
```

## Tournament Event IDs

| Tournament | Event ID |
|------------|----------|
| Paris 2023 | 21 |
| Copenhagen 2024 | 22 |
| Shanghai 2024 | 23 |
| Austin 2025 | 24 |
| Budapest 2025 | 25 |

## License

```
MIT
```
