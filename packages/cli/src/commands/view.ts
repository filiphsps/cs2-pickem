/**
 * @module commands/view
 * @description The view command.
 */
import { createPickEmClient, enrichLayout } from "@cs2-pickem/api";
import chalk from "chalk";
import { Command } from "commander";
import { loadConfig } from "../config-manager.js";
import { displayPredictions } from "../ui/table.js";

/**
 * The view command.
 * @remarks
 * This command allows the user to view their current predictions for a tournament.
 * @example
 * cs2-pickem view <event-id>
 */
export const viewCommand = new Command("view")
    .description("View your current predictions for a tournament")
    .argument("<event-id>", "Tournament event ID (e.g., 25 for Budapest 2025)")
    .action(async (eventId: string) => {
        try {
            const config = await loadConfig();
            const client = createPickEmClient({ apiKey: config.apiKey });

            console.log(chalk.gray("\nFetching predictions...\n"));

            const layout = await client.getTournamentLayout(Number(eventId));
            const predictions = await client.getPredictions({
                eventId: Number(eventId),
                steamId: config.steamId,
                authCode: config.authCode,
            });
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
            displayPredictions(enrichedLayout, predictions);
        } catch (error) {
            console.error(chalk.red("Error:"), (error as Error).message);
            process.exit(1);
        }
    });
