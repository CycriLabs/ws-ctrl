#!/usr/bin/env node
import { Command } from 'commander';
import packageJson from '../package.json';

const handleSigTerm = () => process.exit(0);
process.on('SIGINT', handleSigTerm);
process.on('SIGTERM', handleSigTerm);
process.on('uncaughtException', () => {
  process.exit(1);
});

new Command()
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);
