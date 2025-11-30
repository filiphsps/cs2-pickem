/**
 * @module commands/config
 * @description The config command.
 */
import { input, password } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { saveConfig } from "../config-manager.js";

/**
 * The config command.
 * @remarks
 * This command allows the user to configure the CLI with their Steam API key, Steam ID, and authentication code.
 * @example
 * cs2-pickem config
 */
export const configCommand = new Command("config")
    .description("Configure Steam API key, Steam ID, and authentication code")
    .action(async () => {
        console.log(chalk.bold("\nConfigure CS2 Pick'em CLI\n"));

        console.log(
            chalk.gray("Get your Steam Web API Key: https://steamcommunity.com/dev/apikey")
        );
        console.log(
            chalk.gray(
                "Get your Game Auth Code: https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128\n"
            )
        );

        const apiKey = await input({
            message: "Steam Web API Key:",
            validate: (value) => {
                if (!value || value.trim().length === 0) {
                    return "API Key is required";
                }
                return true;
            },
        });

        const steamId = await input({
            message: "Your Steam ID (SteamID64):",
            validate: (value) => {
                if (!/^\d{17}$/.test(value)) {
                    return "Steam ID must be 17 digits";
                }
                return true;
            },
        });

        const authCode = await password({
            message: "Game Authentication Code (XXXX-XXXXX-XXXX):",
            mask: "*",
            validate: (value) => {
                if (!/^[A-Z0-9]{4}-[A-Z0-9]{5}-[A-Z0-9]{4}$/i.test(value)) {
                    return "Auth code must be in format XXXX-XXXXX-XXXX";
                }
                return true;
            },
        });

        await saveConfig({ apiKey, steamId, authCode });
        console.log(chalk.green("\n✓ Configuration saved successfully!"));
        console.log(chalk.gray("\nYou can now use: cs2-pickem view <event-id>"));
    });
