import { Command } from "commander"
import { select, confirm } from "@inquirer/prompts"
import { createPickEmClient, PickEmGoneError, PickEmPreconditionError } from "@cs2-pickem/api"
import { loadConfig } from "../config-manager.js"
import chalk from "chalk"

export const predictCommand = new Command("predict")
  .description("Make a prediction for a match")
  .argument("<event-id>", "Tournament event ID")
  .option("-s, --section <id>", "Section ID")
  .option("-g, --group <id>", "Group ID")
  .option("-i, --interactive", "Interactive mode to select matches")
  .action(async (eventId: string, options: { section?: string; group?: string; interactive?: boolean }) => {
    try {
      const config = await loadConfig()
      const client = createPickEmClient({ apiKey: config.apiKey })

      console.log(chalk.gray("\nLoading tournament data...\n"))

      const [layout, items] = await Promise.all([
        client.getTournamentLayout(Number(eventId)),
        client.getTournamentItems({
          eventId: Number(eventId),
          steamId: config.steamId,
          authCode: config.authCode,
        }),
      ])

      // Interactive mode - guide user through available matches
      if (options.interactive) {
        // Find sections with open predictions
        const openSections = layout.sections.filter((s) => s.groups.some((g) => g.picksAllowed))

        if (openSections.length === 0) {
          console.log(chalk.yellow("No matches currently available for predictions"))
          return
        }

        const sectionChoice = await select({
          message: "Select a tournament stage:",
          choices: openSections.map((s) => ({
            name: s.name,
            value: s.sectionId,
          })),
        })

        const section = openSections.find((s) => s.sectionId === sectionChoice)
        if (!section) {
          console.log(chalk.red("Section not found"))
          return
        }

        const openGroups = section.groups.filter((g) => g.picksAllowed)

        const groupChoice = await select({
          message: "Select a match:",
          choices: openGroups.map((g) => ({
            name: `${g.name} (${g.pointsPerPick} points)`,
            value: g.groupId,
          })),
        })

        const group = openGroups.find((g) => g.groupId === groupChoice)
        if (!group) {
          console.log(chalk.red("Group not found"))
          return
        }

        // Show available teams
        const teamChoice = await select({
          message: "Pick your winner:",
          choices: group.teams.map((t) => ({
            name: t.name,
            value: t.pickId,
          })),
        })

        // Find user's sticker for this team
        const teamSticker = items.items.find((item) => item.type === "team" && item.teamId === teamChoice)

        if (!teamSticker) {
          const team = group.teams.find((t) => t.pickId === teamChoice)
          console.log(chalk.red(`\n✗ You don't own a sticker for ${team?.name ?? "this team"}!`))
          console.log(
            chalk.gray(
              `\nBuy one here: ${client.getMarketUrl({
                type: "team",
                teamId: teamChoice,
                tournamentId: Number(eventId),
              })}`,
            ),
          )
          return
        }

        // Confirm before locking sticker
        const confirmed = await confirm({
          message: "This will lock your sticker until the match ends. Continue?",
          default: false,
        })

        if (!confirmed) {
          console.log(chalk.gray("Prediction cancelled"))
          return
        }

        // Place prediction
        const result = await client.uploadPrediction({
          eventId: Number(eventId),
          steamId: config.steamId,
          authCode: config.authCode,
          sectionId: section.sectionId,
          groupId: group.groupId,
          index: 0,
          pickId: teamChoice,
          itemId: teamSticker.itemId,
        })

        console.log(chalk.green("\n✓ Prediction placed successfully!"))
        if (result.itemId && result.itemId !== teamSticker.itemId) {
          console.log(chalk.gray(`Note: Item ID changed to ${result.itemId}`))
        }
      } else {
        console.log(chalk.yellow("Use --interactive flag to make predictions interactively"))
        console.log(chalk.gray("Example: cs2-pickem predict 25 --interactive"))
      }
    } catch (error) {
      if (error instanceof PickEmGoneError) {
        console.error(chalk.red("\n✗ Prediction window closed - match has already started"))
      } else if (error instanceof PickEmPreconditionError) {
        console.error(chalk.red("\n✗ This pick conflicts with your previous predictions"))
      } else {
        console.error(chalk.red("Error:"), (error as Error).message)
      }
      process.exit(1)
    }
  })
