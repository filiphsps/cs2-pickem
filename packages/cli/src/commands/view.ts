import { Command } from "commander"
import { createPickEmClient } from "@cs2-pickem/api"
import { loadConfig } from "../config-manager.js"
import { displayPredictions } from "../ui/table.js"
import chalk from "chalk"

export const viewCommand = new Command("view")
  .description("View your current predictions for a tournament")
  .argument("<event-id>", "Tournament event ID (e.g., 25 for Budapest 2025)")
  .action(async (eventId: string) => {
    try {
      const config = await loadConfig()
      const client = createPickEmClient({ apiKey: config.apiKey })

      console.log(chalk.gray("\nFetching predictions...\n"))

      const [layout, predictions] = await Promise.all([
        client.getTournamentLayout(Number(eventId)),
        client.getPredictions({
          eventId: Number(eventId),
          steamId: config.steamId,
          authCode: config.authCode,
        }),
      ])

      displayPredictions(layout, predictions)
    } catch (error) {
      console.error(chalk.red("Error:"), (error as Error).message)
      process.exit(1)
    }
  })
