/**
 * @module ui/table
 * @description The table displays for the CLI.
 */
import type {
    BracketScore,
    CoinTier,
    FantasyLineup,
    TournamentItems,
    TournamentLayout,
    UserPredictions,
} from "@cs2-pickem/api";
import chalk from "chalk";
import Table from "cli-table3";

/**
 * Displays the user's predictions in a table.
 * @param layout The tournament layout.
 * @param predictions The user's predictions.
 */
export const displayPredictions = (
    layout: TournamentLayout,
    predictions: UserPredictions
): void => {
    console.log(chalk.bold("\n📊 Your Pick'em Predictions\n"));

    if (predictions.predictions.length === 0) {
        console.log(chalk.yellow("No predictions made yet."));
        console.log(
            chalk.gray("Use 'cs2-pickem predict <event-id> --interactive' to make predictions")
        );
        return;
    }

    for (const section of layout.sections) {
        const sectionPredictions = section.groups.filter((g) =>
            predictions.predictions.some((p) => p.groupId === g.groupId)
        );

        if (sectionPredictions.length === 0) continue;

        console.log(chalk.cyan.bold(`\n${section.name}`));

        const table = new Table({
            head: [
                chalk.white("Match"),
                chalk.white("Your Pick"),
                chalk.white("Status"),
                chalk.white("Points"),
            ],
            colWidths: [30, 20, 15, 10],
        });

        for (const group of section.groups) {
            const userPreds = predictions.predictions.filter((p) => p.groupId === group.groupId);

            if (userPreds.length === 0) continue;

            for (const userPred of userPreds) {
                const pickedTeam = group.teams.find((t) => t.pickId === userPred.pick);

                let status = "⏳ Pending";
                let points = "-";

                if (group.picks && group.picks.length > 0) {
                    const isCorrect = group.picks.some((pick) =>
                        pick.pickIds.includes(userPred.pick)
                    );

                    if (isCorrect) {
                        status = chalk.green("✓ Correct");
                        points = chalk.green(String(group.pointsPerPick));
                    } else {
                        status = chalk.red("✗ Wrong");
                        points = chalk.red("0");
                    }
                } else if (!group.picksAllowed) {
                    status = chalk.yellow("🔒 Locked");
                }

                table.push([group.name, pickedTeam?.name ?? "Unknown", status, points]);
            }
        }

        console.log(table.toString());
    }
};

/**
 * Displays the user's tournament items.
 * @param items The tournament items to display.
 */
export const displayItems = (items: TournamentItems): void => {
    console.log(chalk.bold("\n🎨 Your Tournament Stickers\n"));

    if (items.items.length === 0) {
        console.log(chalk.yellow("No stickers owned for this tournament."));
        return;
    }

    const teamStickers = items.items.filter((i) => i.type === "team");
    const playerStickers = items.items.filter((i) => i.type === "player");

    if (teamStickers.length > 0) {
        console.log(chalk.cyan.bold("Team Stickers:"));
        const table = new Table({
            head: [chalk.white("Item ID"), chalk.white("Team ID")],
            colWidths: [20, 15],
        });

        for (const sticker of teamStickers) {
            table.push([sticker.itemId, String(sticker.teamId ?? "-")]);
        }
        console.log(table.toString());
    }

    if (playerStickers.length > 0) {
        console.log(chalk.cyan.bold("\nPlayer Stickers:"));
        const table = new Table({
            head: [chalk.white("Item ID"), chalk.white("Player ID")],
            colWidths: [20, 15],
        });

        for (const sticker of playerStickers) {
            table.push([sticker.itemId, String(sticker.playerId ?? "-")]);
        }
        console.log(table.toString());
    }

    console.log(chalk.gray(`\nTotal: ${items.items.length} stickers`));
};

/**
 * Displays the user's score.
 * @param score The user's score.
 * @param coinTier The user's coin tier.
 */
export const displayScore = (score: BracketScore, coinTier: CoinTier): void => {
    console.log(chalk.bold("\n🏆 Your Pick'em Score\n"));

    const coinColors: Record<CoinTier, (text: string) => string> = {
        Diamond: chalk.cyan,
        Gold: chalk.yellow,
        Silver: chalk.gray,
        Bronze: chalk.hex("#CD7F32"),
    };

    const colorFn = coinColors[coinTier];

    console.log(colorFn(`Current Tier: ${coinTier} Coin`));
    console.log(`\nTotal Points: ${chalk.bold(String(score.totalPoints))}`);
    console.log(`Correct Predictions: ${score.correctPredictions}`);
    console.log(`Possible Points: ${score.possiblePoints}`);

    if (score.possiblePoints > 0) {
        const accuracy = Math.round((score.totalPoints / score.possiblePoints) * 100);
        console.log(`Accuracy: ${accuracy}%`);
    }

    if (score.sectionScores.length > 0) {
        console.log(chalk.bold("\n📊 Stage Breakdown:\n"));

        const table = new Table({
            head: [
                chalk.white("Stage"),
                chalk.white("Points"),
                chalk.white("Correct"),
                chalk.white("Accuracy"),
            ],
            colWidths: [25, 10, 12, 12],
        });

        for (const section of score.sectionScores) {
            const accuracy =
                section.totalPicks > 0
                    ? `${Math.round((section.correctPicks / section.totalPicks) * 100)}%`
                    : "-";

            table.push([
                section.sectionName,
                String(section.points),
                `${section.correctPicks}/${section.totalPicks}`,
                accuracy,
            ]);
        }

        console.log(table.toString());
    }

    // Show tier progression
    const tierThresholds = [
        { tier: "Bronze", min: 0, max: 49 },
        { tier: "Silver", min: 50, max: 74 },
        { tier: "Gold", min: 75, max: 99 },
        { tier: "Diamond", min: 100, max: Number.POSITIVE_INFINITY },
    ];

    const currentTierInfo = tierThresholds.find((t) => t.tier === coinTier);
    const nextTierInfo = tierThresholds.find(
        (t) => t.min > score.totalPoints && t.tier !== coinTier
    );

    if (nextTierInfo && currentTierInfo) {
        const pointsNeeded = nextTierInfo.min - score.totalPoints;
        console.log(chalk.gray(`\nPoints to ${nextTierInfo.tier}: ${pointsNeeded}`));
    } else if (coinTier === "Diamond") {
        console.log(chalk.cyan("\n★ Maximum tier achieved!"));
    }
};

/**
 * Displays the user's fantasy lineup.
 * @param lineup The user's fantasy lineup.
 */
export const displayFantasy = (lineup: FantasyLineup): void => {
    console.log(chalk.bold("\n⭐ Fantasy Team Lineup\n"));

    if (lineup.teams.length === 0) {
        console.log(chalk.yellow("No fantasy lineup set."));
        return;
    }

    for (const team of lineup.teams) {
        console.log(chalk.cyan.bold(`Section ${team.sectionId}:`));

        if (team.picks.length === 0) {
            console.log(chalk.gray("  No players selected"));
        } else {
            const table = new Table({
                head: [chalk.white("#"), chalk.white("Player ID")],
                colWidths: [5, 20],
            });

            team.picks.forEach((playerId, idx) => {
                table.push([String(idx + 1), String(playerId)]);
            });

            console.log(table.toString());
        }
    }
};
