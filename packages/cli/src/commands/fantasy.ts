/**
 * @module commands/fantasy
 * @description The fantasy command.
 */
import { createPickEmClient } from "@cs2-pickem/api";
import chalk from "chalk";
import { Command } from "commander";
import { loadConfig } from "../config-manager.js";
import { displayFantasy } from "../ui/table.js";

/**
 * The fantasy command.
 * @remarks
 * This command allows the user to view their fantasy lineup for a tournament.
 * @example
 * cs2-pickem fantasy <event-id>
 */
export const fantasyCommand = new Command("fantasy")
    .description("Manage your Fantasy team lineup")
    .argument("<event-id>", "Tournament event ID")
    .option("-v, --view", "View current lineup")
    .action(async (eventId: string, options: { view?: boolean }) => {
        try {
            const config = await loadConfig();
            const client = createPickEmClient({ apiKey: config.apiKey });

            console.log(chalk.gray("\nFetching fantasy lineup...\n"));

            const lineup = await client.getFantasyLineup({
                eventId: Number(eventId),
                steamId: config.steamId,
                authCode: config.authCode,
            });

            displayFantasy(lineup);

            if (!options.view) {
                console.log(
                    chalk.gray(
                        "\nUse the Steam client or CS2 in-game to modify your Fantasy lineup"
                    )
                );
            }
        } catch (error) {
            console.error(chalk.red("Error:"), (error as Error).message);
            process.exit(1);
        }
    });
