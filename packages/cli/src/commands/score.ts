import { Command } from "commander"
import { createPickEmClient, calculateBracketScore, getCoinTier } from "@cs2-pickem/api"
import { loadConfig } from "../config-manager.js"
import { displayScore } from "../ui/table.js"
import chalk from "chalk"

export const scoreCommand = new Command("score")
  .description("Calculate your current Pick'em score")
  .argument("<event-id>", "Tournament event ID")
  .action(async (eventId: string) => {
    try {
      const config = await loadConfig()
      const client = createPickEmClient({ apiKey: config.apiKey })

      console.log(chalk.gray("\nCalculating score...\n"))

      const [layout, predictions] = await Promise.all([
        client.getTournamentLayout(Number(eventId)),
        client.getPredictions({
          eventId: Number(eventId),
          steamId: config.steamId,
          authCode: config.authCode,
        }),
      ])

      const score = calculateBracketScore(layout, predictions)
      const coinTier = getCoinTier(score.totalPoints)

      displayScore(score, coinTier)
    } catch (error) {
      console.error(chalk.red("Error:"), (error as Error).message)
      process.exit(1)
    }
  })
