import { Command } from "commander"
import { createPickEmClient } from "@cs2-pickem/api"
import { loadConfig } from "../config-manager.js"
import { displayLayout } from "../ui/bracket.js"
import chalk from "chalk"

export const layoutCommand = new Command("layout")
  .description("View tournament bracket structure")
  .argument("<event-id>", "Tournament event ID (e.g., 25 for Budapest 2025)")
  .action(async (eventId: string) => {
    try {
      const config = await loadConfig()
      const client = createPickEmClient({ apiKey: config.apiKey })

      console.log(chalk.gray("\nFetching tournament layout...\n"))

      const layout = await client.getTournamentLayout(Number(eventId))
      displayLayout(layout)
    } catch (error) {
      console.error(chalk.red("Error:"), (error as Error).message)
      process.exit(1)
    }
  })
