/**
 * @module ui/prompts
 * @description The prompts for the CLI.
 */
import { confirm, input, password, select } from "@inquirer/prompts";
import chalk from "chalk";

/**
 * Represents a team selection.
 */
export interface TeamSelection {
    /** The ID of the team. */
    teamId: number;
    /** The name of the team. */
    teamName: string;
}

/**
 * Prompts the user to select a team.
 * @param teams The list of teams to choose from.
 * @param message The message to display to the user.
 * @returns A promise that resolves with the selected team's ID.
 */
export const selectTeam = async (
    teams: Array<{ pickId: number; name: string }>,
    message = "Select a team:"
): Promise<number> => {
    const choice = await select({
        message,
        choices: teams.map((t) => ({
            name: t.name,
            value: t.pickId,
        })),
    });

    return choice;
};

/**
 * Prompts the user to confirm an action.
 * @param message The message to display to the user.
 * @param defaultValue The default value for the confirmation.
 * @returns A promise that resolves with the user's confirmation.
 */
export const confirmAction = async (message: string, defaultValue = false): Promise<boolean> => {
    return confirm({
        message,
        default: defaultValue,
    });
};

/**
 * Prompts the user to enter their Steam ID.
 * @returns A promise that resolves with the user's Steam ID.
 */
export const promptSteamId = async (): Promise<string> => {
    return input({
        message: "Your Steam ID (SteamID64):",
        validate: (value) => {
            if (!/^\d{17}$/.test(value)) {
                return "Steam ID must be 17 digits";
            }
            return true;
        },
    });
};

/**
 * Prompts the user to enter their authentication code.
 * @returns A promise that resolves with the user's authentication code.
 */
export const promptAuthCode = async (): Promise<string> => {
    return password({
        message: "Game Authentication Code:",
        mask: "*",
        validate: (value) => {
            if (!/^[A-Z0-9]{4}-[A-Z0-9]{5}-[A-Z0-9]{4}$/i.test(value)) {
                return "Auth code must be in format XXXX-XXXXX-XXXX";
            }
            return true;
        },
    });
};

/**
 * Displays an error message.
 * @param message The message to display.
 */
export const displayError = (message: string): void => {
    console.error(chalk.red("Error:"), message);
};

/**
 * Displays a success message.
 * @param message The message to display.
 */
export const displaySuccess = (message: string): void => {
    console.log(chalk.green("✓"), message);
};

/**
 * Displays a warning message.
 * @param message The message to display.
 */
export const displayWarning = (message: string): void => {
    console.log(chalk.yellow("⚠"), message);
};

/**
 * Displays an info message.
 * @param message The message to display.
 */
export const displayInfo = (message: string): void => {
    console.log(chalk.blue("ℹ"), message);
};
