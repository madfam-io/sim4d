#!/usr/bin/env node

import { Command } from 'commander';
import { renderCommand } from './commands/render';
import { sweepCommand } from './commands/sweep';
import { validateCommand } from './commands/validate';
import { infoCommand } from './commands/info';

const program = new Command();

// CLI configuration
program
  .name('sim4d')
  .description('Sim4D CLI - Headless parametric CAD rendering')
  .version('0.1.0')
  .option('-v, --verbose', 'verbose output')
  .option('-q, --quiet', 'suppress non-error output');

// Add commands
program.addCommand(renderCommand);
program.addCommand(sweepCommand);
program.addCommand(validateCommand);
program.addCommand(infoCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
