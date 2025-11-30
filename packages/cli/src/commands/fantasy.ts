import { Command } from "commander"
import { createPickEmClient } from "@cs2-pickem/api"
import { loadConfig } from "../config-manager.js"
import { displayFantasy } from "../ui/table.js"
import chalk from "chalk"

export const fantasyCommand = new Command("fantasy")
  .description("Manage your Fantasy team lineup")
  .argument("<event-id>", "Tournament event ID")
  .option("-v, --view", "View current lineup")
  .action(async (eventId: string, options: { view?: boolean }) => {
    try {
      const config = await loadConfig()
      const client = createPickEmClient({ apiKey: config.apiKey })

      console.log(chalk.gray("\nFetching fantasy lineup...\n"))

      const lineup = await client.getFantasyLineup({
        eventId: Number(eventId),
        steamId: config.steamId,
        authCode: config.authCode,
      })

      displayFantasy(lineup)

      if (!options.view) {
        console.log(chalk.gray("\nUse the Steam client or CS2 in-game to modify your Fantasy lineup"))
      }
    } catch (error) {
      console.error(chalk.red("Error:"), (error as Error).message)
      process.exit(1)
    }
  })
