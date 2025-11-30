/**
 * @module commands/layout
 * @description The layout command.
 */
import { createPickEmClient, enrichLayout } from "@cs2-pickem/api";
import chalk from "chalk";
import { Command } from "commander";
import { loadConfig } from "../config-manager.js";
import { displayLayout } from "../ui/bracket.js";

/**
 * The layout command.
 * @remarks
 * This command allows the user to view the tournament bracket structure.
 * @example
 * cs2-pickem layout <event-id>
 */
export const layoutCommand = new Command("layout")
    .description("View tournament bracket structure")
    .argument("<event-id>", "Tournament event ID (e.g., 25 for Budapest 2025)")
    .action(async (eventId: string) => {
        try {
            const config = await loadConfig();
            const client = createPickEmClient({ apiKey: config.apiKey });

            console.log(chalk.gray("\nFetching tournament layout...\n"));

            const layout = await client.getTournamentLayout(Number(eventId));
            const items = await client
                .getTournamentItems({
                    eventId: Number(eventId),
                    steamId: config.steamId,
                    authCode: config.authCode,
                })
                .catch(() => ({ items: [] }));
            const inventory = await client.getInventory(config.steamId).catch(() => ({
                assets: [],
                descriptions: [],
                total_inventory_count: 0,
                success: 1,
                rwgrsn: 0,
            }));

            const enrichedLayout = enrichLayout(layout, items, inventory);
            displayLayout(enrichedLayout);
        } catch (error) {
            console.error(chalk.red("Error:"), (error as Error).message);
            process.exit(1);
        }
    });
