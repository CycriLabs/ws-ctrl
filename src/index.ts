#!/usr/bin/env node
import { Command } from 'commander';
import packageJson from '../package.json';
import { init, run, sync } from './commands/index.js';
import { logger } from './utils/index.js';

const handleSigTerm = () => process.exit(0);
process.on('SIGINT', handleSigTerm);
process.on('SIGTERM', handleSigTerm);
process.on('uncaughtException', err => {
  logger.error(err.message);
  process.exit(1);
});

new Command()
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)
  .addCommand(init)
  .addCommand(run)
  .addCommand(sync)
  .parseAsync()
  .catch(err => {
    logger.error(err.message);
    process.exit(1);
  })
  .finally(() => logger.success('Finished execution.'));
