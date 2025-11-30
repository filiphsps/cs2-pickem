import { Command } from "commander"
import { createPickEmClient } from "@cs2-pickem/api"
import { loadConfig } from "../config-manager.js"
import { displayItems } from "../ui/table.js"
import chalk from "chalk"

export const itemsCommand = new Command("items")
  .description("List your owned tournament stickers")
  .argument("<event-id>", "Tournament event ID")
  .action(async (eventId: string) => {
    try {
      const config = await loadConfig()
      const client = createPickEmClient({ apiKey: config.apiKey })

      console.log(chalk.gray("\nFetching your stickers...\n"))

      const items = await client.getTournamentItems({
        eventId: Number(eventId),
        steamId: config.steamId,
        authCode: config.authCode,
      })

      displayItems(items)
    } catch (error) {
      console.error(chalk.red("Error:"), (error as Error).message)
      process.exit(1)
    }
  })
