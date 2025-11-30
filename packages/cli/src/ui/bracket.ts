import chalk from "chalk"
import type { TournamentLayout } from "@cs2-pickem/api"

export const displayLayout = (layout: TournamentLayout): void => {
  console.log(chalk.bold("\n🏆 Tournament Bracket\n"))

  for (const section of layout.sections) {
    console.log(chalk.cyan.bold(`\n═══ ${section.name} ═══`))

    const openGroups = section.groups.filter((g) => g.picksAllowed)
    const closedGroups = section.groups.filter((g) => !g.picksAllowed)

    if (openGroups.length > 0) {
      console.log(chalk.green(`\n  Open for predictions (${openGroups.length} matches):`))
      for (const group of openGroups) {
        console.log(chalk.white(`    • ${group.name} (${group.pointsPerPick} pts)`))
        if (group.teams.length > 0) {
          const teamNames = group.teams.map((t) => t.name).join(" vs ")
          console.log(chalk.gray(`      ${teamNames}`))
        }
      }
    }

    if (closedGroups.length > 0) {
      console.log(chalk.gray(`\n  Locked/Completed (${closedGroups.length} matches):`))
      for (const group of closedGroups) {
        let status = "🔒"
        let resultText = ""

        if (group.picks && group.picks.length > 0) {
          status = "✓"
          const winnerIds = group.picks.flatMap((p) => p.pickIds)
          const winners = group.teams.filter((t) => winnerIds.includes(t.pickId))
          resultText = winners.length > 0 ? ` → ${winners.map((w) => w.name).join(", ")}` : ""
        }

        console.log(chalk.gray(`    ${status} ${group.name}${resultText}`))
      }
    }
  }

  console.log()
}
