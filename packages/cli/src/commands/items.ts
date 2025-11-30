/**
 * @module commands/items
 * @description The items command.
 */
import { createPickEmClient } from "@cs2-pickem/api";
import chalk from "chalk";
import { Command } from "commander";
import { loadConfig } from "../config-manager.js";
import { displayItems } from "../ui/table.js";

/**
 * The items command.
 * @remarks
 * This command allows the user to view their tournament items (stickers).
 * @example
 * cs2-pickem items <event-id>
 */
export const itemsCommand = new Command("items")
    .description("List your owned tournament stickers")
    .argument("<event-id>", "Tournament event ID")
    .action(async (eventId: string) => {
        try {
            const config = await loadConfig();
            const client = createPickEmClient({ apiKey: config.apiKey });

            console.log(chalk.gray("\nFetching your stickers...\n"));

            const items = await client.getTournamentItems({
                eventId: Number(eventId),
                steamId: config.steamId,
                authCode: config.authCode,
            });

            displayItems(items);
        } catch (error) {
            console.error(chalk.red("Error:"), (error as Error).message);
            process.exit(1);
        }
    });
