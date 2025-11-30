/**
 * @module commands/score
 * @description The score command.
 */
import { calculateBracketScore, createPickEmClient, getCoinTier } from "@cs2-pickem/api";
import chalk from "chalk";
import { Command } from "commander";
import { loadConfig } from "../config-manager.js";
import { displayScore } from "../ui/table.js";

/**
 * The score command.
 * @remarks
 * This command allows the user to view their score for a tournament.
 * @example
 * cs2-pickem score <event-id>
 */
export const scoreCommand = new Command("score")
    .description("Calculate your current Pick'em score")
    .argument("<event-id>", "Tournament event ID")
    .action(async (eventId: string) => {
        try {
            const config = await loadConfig();
            const client = createPickEmClient({ apiKey: config.apiKey });

            console.log(chalk.gray("\nCalculating score...\n"));

            const [layout, predictions] = await Promise.all([
                client.getTournamentLayout(Number(eventId)),
                client.getPredictions({
                    eventId: Number(eventId),
                    steamId: config.steamId,
                    authCode: config.authCode,
                }),
            ]);

            const score = calculateBracketScore(layout, predictions);
            const coinTier = getCoinTier(score.totalPoints);

            displayScore(score, coinTier);
        } catch (error) {
            console.error(chalk.red("Error:"), (error as Error).message);
            process.exit(1);
        }
    });
