#!/usr/bin/env node
import { Command } from "commander"
import { configCommand } from "./commands/config.js"
import { layoutCommand } from "./commands/layout.js"
import { viewCommand } from "./commands/view.js"
import { predictCommand } from "./commands/predict.js"
import { itemsCommand } from "./commands/items.js"
import { scoreCommand } from "./commands/score.js"
import { fantasyCommand } from "./commands/fantasy.js"

const program = new Command()

program.name("cs2-pickem").description("CLI tool to manage CS2 Major Pick'em predictions").version("1.0.0")

// Add all commands
program.addCommand(configCommand)
program.addCommand(layoutCommand)
program.addCommand(viewCommand)
program.addCommand(predictCommand)
program.addCommand(itemsCommand)
program.addCommand(scoreCommand)
program.addCommand(fantasyCommand)

program.parse()
