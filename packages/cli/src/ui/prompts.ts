import { input, select, confirm, password } from "@inquirer/prompts"
import chalk from "chalk"

export interface TeamSelection {
  teamId: number
  teamName: string
}

export const selectTeam = async (
  teams: Array<{ pickId: number; name: string }>,
  message = "Select a team:",
): Promise<number> => {
  const choice = await select({
    message,
    choices: teams.map((t) => ({
      name: t.name,
      value: t.pickId,
    })),
  })

  return choice
}

export const confirmAction = async (message: string, defaultValue = false): Promise<boolean> => {
  return confirm({
    message,
    default: defaultValue,
  })
}

export const promptSteamId = async (): Promise<string> => {
  return input({
    message: "Your Steam ID (SteamID64):",
    validate: (value) => {
      if (!/^\d{17}$/.test(value)) {
        return "Steam ID must be 17 digits"
      }
      return true
    },
  })
}

export const promptAuthCode = async (): Promise<string> => {
  return password({
    message: "Game Authentication Code:",
    mask: "*",
    validate: (value) => {
      if (!/^[A-Z0-9]{4}-[A-Z0-9]{5}-[A-Z0-9]{4}$/i.test(value)) {
        return "Auth code must be in format XXXX-XXXXX-XXXX"
      }
      return true
    },
  })
}

export const displayError = (message: string): void => {
  console.error(chalk.red("Error:"), message)
}

export const displaySuccess = (message: string): void => {
  console.log(chalk.green("✓"), message)
}

export const displayWarning = (message: string): void => {
  console.log(chalk.yellow("⚠"), message)
}

export const displayInfo = (message: string): void => {
  console.log(chalk.blue("ℹ"), message)
}
